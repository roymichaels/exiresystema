// Phase 2M — Direct landing lead submit with dedup.
//
// Anonymous endpoint. Replaces the direct `INSERT INTO leads` from /
// and /exire. Service-role only so RLS isn't a problem.
//
// Behaviour:
//   1. Validate input.
//   2. Normalize phone (IL) + lowercase email.
//   3. Look up an existing lead within the "landing source set" matching the
//      same phone OR email (most-recent wins).
//   4. If found:
//        - DO NOT create a duplicate.
//        - Append latest_submission to metadata, preserve prior data.
//        - Add a `resubmitted` tag if missing.
//        - Insert a lead_activity row of kind=resubmitted_landing_form.
//        - Return { ok, lead_id, duplicate: true }.
//   5. If not:
//        - Insert lead + lead_activity + conversion_events (matching previous
//          shape so the CRM/Dashboard keep working).
//        - Return { ok, lead_id, duplicate: false }.
//
// User-facing: caller treats both branches as success (same thank-you state).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LANDING_SOURCES = [
  "homepage",
  "exire_landing",
  "exire_form",
  "exire_instagram_form",
] as const;

type SubmitPayload = {
  source?: string;
  full_name?: string;
  phone?: string;
  email?: string | null;
  main_challenge?: string;
  desired_result?: string;
  what_have_you_tried?: string | null;
  instagram_handle?: string | null;
  notes?: string | null;
  utm?: Record<string, unknown>;
};

const normPhone = (p?: string | null): string | null => {
  if (!p) return null;
  let v = String(p).replace(/[^\d+]/g, "");
  if (v.startsWith("00")) v = "+" + v.slice(2);
  if (v.startsWith("0")) v = "+972" + v.slice(1);
  if (!v.startsWith("+") && v.length >= 9) v = "+" + v;
  return v || null;
};

const normEmail = (e?: string | null): string | null => {
  if (!e) return null;
  const v = String(e).trim().toLowerCase();
  return v.includes("@") ? v : null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as SubmitPayload;
    const name = (body.full_name || "").trim();
    const phone = normPhone(body.phone);
    const email = normEmail(body.email);
    const source = (body.source && (LANDING_SOURCES as readonly string[]).includes(body.source))
      ? body.source!
      : "exire_landing";

    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ error: "name_required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!phone && !email) {
      return new Response(JSON.stringify({ error: "contact_required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const noteParts = [
      body.main_challenge ? `אתגר עיקרי: ${body.main_challenge}` : "",
      body.desired_result ? `תוצאה רצויה: ${body.desired_result}` : "",
      body.what_have_you_tried ? `מה ניסה כבר: ${body.what_have_you_tried}` : "",
      body.instagram_handle ? `אינסטגרם: ${body.instagram_handle}` : "",
      body.notes || "",
    ].filter(Boolean).join("\n");

    const submissionSnapshot = {
      at: new Date().toISOString(),
      source,
      name,
      phone,
      email,
      main_challenge: body.main_challenge || null,
      desired_result: body.desired_result || null,
      what_have_you_tried: body.what_have_you_tried || null,
      instagram_handle: body.instagram_handle || null,
      utm: body.utm || {},
    };

    // --- Dedup lookup ----------------------------------------------------
    // Search landing-source leads by phone OR email. Most recent wins.
    let existing: { id: string; metadata: Record<string, unknown> | null; tags: string[] | null } | null = null;
    {
      const orParts: string[] = [];
      if (phone) orParts.push(`phone.eq.${phone}`);
      if (email) orParts.push(`email.eq.${email}`);
      if (orParts.length) {
        const { data } = await admin
          .from("leads")
          .select("id, metadata, tags, source, created_at")
          .in("source", LANDING_SOURCES as unknown as string[])
          .or(orParts.join(","))
          .order("created_at", { ascending: false })
          .limit(1);
        if (data && data.length) existing = data[0] as typeof existing;
      }
    }

    if (existing) {
      // Preserve previous metadata; append latest_submission + history.
      const prevMeta = (existing.metadata && typeof existing.metadata === "object")
        ? existing.metadata as Record<string, unknown>
        : {};
      const prevHistory = Array.isArray(prevMeta.submission_history)
        ? (prevMeta.submission_history as unknown[])
        : [];
      const nextMeta: Record<string, unknown> = {
        ...prevMeta,
        latest_submission: submissionSnapshot,
        submission_history: [...prevHistory, submissionSnapshot].slice(-10),
        resubmitted_at: submissionSnapshot.at,
        resubmit_count: (typeof prevMeta.resubmit_count === "number" ? prevMeta.resubmit_count as number : 0) + 1,
      };
      const prevTags = Array.isArray(existing.tags) ? existing.tags as string[] : [];
      const nextTags = prevTags.includes("resubmitted") ? prevTags : [...prevTags, "resubmitted"];

      await admin
        .from("leads")
        .update({ metadata: nextMeta, tags: nextTags, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      await admin.from("lead_activity").insert({
        lead_id: existing.id,
        kind: "resubmitted_landing_form",
        direction: "inbound",
        subject: `resubmitted_${source}`,
        body: noteParts,
        payload: { source, submission: submissionSnapshot } as never,
        status: "received",
      } as never);

      return new Response(JSON.stringify({ ok: true, lead_id: existing.id, duplicate: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- New lead --------------------------------------------------------
    const insertPayload = {
      name,
      phone,
      email,
      source,
      status: "new",
      notes: noteParts,
      pain_category: (body.main_challenge || "").slice(0, 120) || null,
      desired_outcome: body.desired_result || null,
      prior_attempts: body.what_have_you_tried ? [body.what_have_you_tried] : null,
      metadata: {
        instagram_handle: body.instagram_handle || null,
        language: "he",
        consent_at: submissionSnapshot.at,
        latest_submission: submissionSnapshot,
        submission_history: [submissionSnapshot],
        ...(body.utm || {}),
      },
      tags: [source],
    };

    const { data: lead, error } = await admin
      .from("leads")
      .insert(insertPayload as never)
      .select("id")
      .single();
    if (error) throw error;
    const leadId = (lead as { id: string }).id;

    await Promise.all([
      admin.from("lead_activity").insert({
        lead_id: leadId,
        kind: "form_submission",
        direction: "inbound",
        subject: `submitted_${source}`,
        body: noteParts,
        payload: { source, submission: submissionSnapshot } as never,
        status: "received",
      } as never),
      admin.from("conversion_events").insert({
        event_type: "lead_submitted",
        event_category: "exire_funnel",
        source,
        page_path: (body.utm && (body.utm as Record<string, unknown>).path) as string | null,
        event_data: { lead_id: leadId, ...(body.utm || {}) } as never,
        conversion_value: 1,
      } as never),
    ]);

    return new Response(JSON.stringify({ ok: true, lead_id: leadId, duplicate: false }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-landing-lead error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
