// Phase 2K — Sync a form_submission into the CRM leads flow.
//
// Idempotent. Safe to call from the public form (anon) after a successful
// submission and from the admin retro-import button.
//
// Inputs: { submission_id?: string, form_id?: string }
//   - submission_id: sync one submission
//   - form_id:       sync all unsynced submissions for a mapped form
//
// Behaviour:
//   1. Look up an active xsystem_lead_form_mappings row for the form.
//   2. If none -> no-op (returns { skipped: true }). Public form continues to work.
//   3. Map answers -> lead fields using mapping.field_mapping or label heuristics.
//   4. Dedupe by: form_submissions.lead_id, leads.metadata->>form_submission_id,
//      or (form_id + phone/email) on the leads side.
//   5. Insert lead row, lead_activity row, and (optional) xsystem_followups row.
//   6. Update form_submissions.lead_id + synced_to_lead_at.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Submission = {
  id: string;
  form_id: string;
  responses: Record<string, unknown> | null;
  email: string | null;
  metadata: Record<string, unknown> | null;
  lead_id: string | null;
  synced_to_lead_at: string | null;
};

type FormField = {
  id: string;
  label: string;
  type: string;
};

type Mapping = {
  id: string;
  practitioner_id: string;
  form_id: string;
  source_key: string;
  is_active: boolean;
  auto_sync: boolean;
  create_followup: boolean;
  field_mapping: Record<string, string>;
  tags: string[];
};

const LABEL_RULES: Array<{ key: string; match: RegExp }> = [
  { key: "name",            match: /(שם מלא|שם|name|full[_ ]?name)/i },
  { key: "phone",           match: /(טלפון|וואטסאפ|whatsapp|phone|נייד|מספר)/i },
  { key: "email",           match: /(אימייל|מייל|email|e-mail)/i },
  { key: "instagram",       match: /(אינסטגרם|אינסטה|instagram|@)/i },
  { key: "pain_category",   match: /(אתגר|כאב|בעיה|מה.*עובר|תקוע|challenge|pain|problem|struggle)/i },
  { key: "desired_outcome", match: /(תוצאה|יעד|רוצה|שינוי|חזון|מטרה|result|goal|outcome|vision|want)/i },
  { key: "prior_attempts",  match: /(ניסית|ניסיתי|ניסיון|tried|previous|attempt)/i },
];

function classifyField(field: FormField, mapping: Mapping): string | null {
  const explicit = mapping.field_mapping?.[field.id];
  if (explicit) return explicit;
  if (field.type === "email") return "email";
  if (field.type === "phone") return "phone";
  const label = field.label || "";
  for (const r of LABEL_RULES) {
    if (r.match.test(label)) return r.key;
  }
  return null;
}

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.length ? v.join(", ") : null;
  if (typeof v === "string") return v.trim() || null;
  return String(v);
}

function asArray(v: unknown): string[] | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  const s = asString(v);
  return s ? [s] : null;
}

async function syncOne(
  admin: ReturnType<typeof createClient>,
  submission: Submission,
  formTitle: string,
  fields: FormField[],
  mapping: Mapping,
): Promise<{ leadId: string; created: boolean }> {
  // Already synced via column
  if (submission.lead_id) {
    return { leadId: submission.lead_id, created: false };
  }

  // Map responses
  const responses = submission.responses ?? {};
  const mapped: Record<string, unknown> = {};
  const answersByLabel: Record<string, unknown> = {};
  for (const f of fields) {
    const key = classifyField(f, mapping);
    const val = (responses as Record<string, unknown>)[f.id];
    if (val !== undefined && val !== null && val !== "") {
      answersByLabel[f.label] = val;
      if (key) {
        if (key === "prior_attempts") {
          mapped[key] = asArray(val);
        } else {
          mapped[key] = asString(val);
        }
      }
    }
  }

  const name = (mapped.name as string) || "ליד מטופס";
  const phone = (mapped.phone as string) || null;
  const email = (mapped.email as string) || submission.email || null;

  // Dedupe — look for an existing lead with this submission id in metadata,
  // or (form_id + phone/email) match.
  const { data: existing } = await admin
    .from("leads")
    .select("id")
    .or(
      [
        `metadata->>form_submission_id.eq.${submission.id}`,
        phone ? `and(phone.eq.${phone},metadata->>form_id.eq.${submission.form_id})` : null,
        email ? `and(email.eq.${email},metadata->>form_id.eq.${submission.form_id})` : null,
      ]
        .filter(Boolean)
        .join(","),
    )
    .limit(1)
    .maybeSingle();

  let leadId: string;
  let created = false;

  if (existing?.id) {
    leadId = existing.id as string;
  } else {
    const leadInsert: Record<string, unknown> = {
      name,
      phone,
      email,
      source: mapping.source_key,
      status: "new",
      tags: mapping.tags,
      pain_category: mapped.pain_category ?? null,
      desired_outcome: mapped.desired_outcome ?? null,
      prior_attempts: mapped.prior_attempts ?? null,
      metadata: {
        form_id: submission.form_id,
        form_title: formTitle,
        form_submission_id: submission.id,
        instagram: mapped.instagram ?? null,
        form_answers: answersByLabel,
        synced_via: "xsystem_lead_form_mappings",
      },
    };
    const { data: leadRow, error: leadErr } = await admin
      .from("leads")
      .insert(leadInsert as never)
      .select("id")
      .single();
    if (leadErr) throw leadErr;
    leadId = leadRow!.id as string;
    created = true;

    // Activity
    await admin.from("lead_activity").insert({
      lead_id: leadId,
      kind: "form_submission",
      direction: "inbound",
      subject: "submitted_exire_lead_form",
      body: formTitle,
      payload: {
        form_id: submission.form_id,
        form_submission_id: submission.id,
        form_title: formTitle,
        source_key: mapping.source_key,
        mapped_fields: mapped,
      },
    } as never);

    // Follow-up
    if (mapping.create_followup) {
      const due = new Date();
      due.setHours(due.getHours() + 4);
      const body =
        [
          mapped.pain_category ? `אתגר: ${mapped.pain_category}` : null,
          mapped.desired_outcome ? `רוצה: ${mapped.desired_outcome}` : null,
        ]
          .filter(Boolean)
          .join("\n") || null;
      await admin.from("xsystem_followups").insert({
        practitioner_id: mapping.practitioner_id,
        client_id: null,
        lead_id: leadId,
        title: "לחזור לליד מטופס Exire",
        body,
        priority: "high",
        status: "open",
        source: "form",
        due_at: due.toISOString(),
      } as never);
    }
  }

  // Always stamp the submission
  await admin
    .from("form_submissions")
    .update({ lead_id: leadId, synced_to_lead_at: new Date().toISOString() } as never)
    .eq("id", submission.id);

  return { leadId, created };
}

// UUID v4-ish guard. Cheap input validation for public surface.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const submissionId = (body as Record<string, unknown>).submission_id as string | undefined;
    const formId = (body as Record<string, unknown>).form_id as string | undefined;

    if (submissionId && !UUID_RE.test(submissionId)) {
      return new Response(JSON.stringify({ ok: false, skipped: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (formId && !UUID_RE.test(formId)) {
      return new Response(JSON.stringify({ error: "invalid_form_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Bulk import by form_id requires an authenticated admin/practitioner.
    // Single-submission sync (the public path) stays anonymous but is heavily
    // constrained: it only runs against submissions that map to an active
    // xsystem_lead_form_mappings row and the response never leaks answers.
    const isBulk = !!formId && !submissionId;
    if (isBulk) {
      const authHeader = req.headers.get("Authorization") || "";
      if (!authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const token = authHeader.slice(7);
      const authed = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: claims, error: claimsErr } = await authed.auth.getClaims(token);
      const uid = claims?.claims?.sub as string | undefined;
      if (claimsErr || !uid) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Must own an active mapping for this form (RLS on user_roles via has_role
      // is not required here — ownership of the mapping IS the practitioner check).
      const { data: ownMap } = await admin
        .from("xsystem_lead_form_mappings")
        .select("id")
        .eq("form_id", formId!)
        .eq("practitioner_id", uid)
        .eq("is_active", true)
        .maybeSingle();
      if (!ownMap) {
        return new Response(JSON.stringify({ error: "forbidden_or_no_active_mapping" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Collect submissions to process
    let submissions: Submission[] = [];
    if (submissionId) {
      const { data, error } = await admin
        .from("form_submissions")
        .select("id, form_id, responses, email, metadata, lead_id, synced_to_lead_at")
        .eq("id", submissionId)
        .maybeSingle();
      if (error) throw error;
      if (data) submissions = [data as unknown as Submission];
    } else if (formId) {
      const { data, error } = await admin
        .from("form_submissions")
        .select("id, form_id, responses, email, metadata, lead_id, synced_to_lead_at")
        .eq("form_id", formId)
        .is("lead_id", null)
        .order("submitted_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      submissions = (data || []) as unknown as Submission[];
    } else {
      return new Response(JSON.stringify({ error: "submission_id or form_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (submissions.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, created: 0, skipped: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by form for mapping/field fetch
    const formIds = Array.from(new Set(submissions.map((s) => s.form_id)));
    const { data: formsData } = await admin
      .from("custom_forms")
      .select("id, title")
      .in("id", formIds);
    const { data: mappingsData } = await admin
      .from("xsystem_lead_form_mappings")
      .select("*")
      .in("form_id", formIds)
      .eq("is_active", true);
    const { data: fieldsData } = await admin
      .from("form_fields")
      .select("id, label, type, form_id")
      .in("form_id", formIds);

    const formTitleMap = new Map<string, string>(
      ((formsData || []) as Array<{ id: string; title: string }>).map((f) => [f.id, f.title]),
    );
    const mappingMap = new Map<string, Mapping>(
      ((mappingsData || []) as Mapping[]).map((m) => [m.form_id, m]),
    );
    const fieldsByForm = new Map<string, FormField[]>();
    for (const f of (fieldsData || []) as Array<FormField & { form_id: string }>) {
      const arr = fieldsByForm.get(f.form_id) || [];
      arr.push(f);
      fieldsByForm.set(f.form_id, arr);
    }

    let created = 0;
    let processed = 0;
    let skipped = 0;
    const results: Array<{ submission_id: string; lead_id?: string; created?: boolean; skipped?: boolean }> = [];

    for (const sub of submissions) {
      const mapping = mappingMap.get(sub.form_id);
      if (!mapping) {
        skipped++;
        results.push({ submission_id: sub.id, skipped: true });
        continue;
      }
      try {
        const r = await syncOne(
          admin,
          sub,
          formTitleMap.get(sub.form_id) || "טופס",
          fieldsByForm.get(sub.form_id) || [],
          mapping,
        );
        processed++;
        if (r.created) created++;
        results.push({ submission_id: sub.id, lead_id: r.leadId, created: r.created });
      } catch (e) {
        console.error("sync error", sub.id, e);
        results.push({ submission_id: sub.id, skipped: true });
        skipped++;
      }
    }

    return new Response(JSON.stringify({ ok: true, processed, created, skipped, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
