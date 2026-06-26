/**
 * Exire Advisor — המוח העסקי
 *
 * Admin-only, read-only business mentor for the Exire Systema operator.
 * - Verifies caller is authenticated and has the `admin` role.
 * - Builds a small, capped daily business context (leads, sessions, payments,
 *   follow-ups, funnel setup). Strictly read-only — no DB writes, no
 *   side-effect tools, no messaging.
 * - Replies in Hebrew via the shared aiGateway helper.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { aiChatCompletion } from "../_shared/aiGateway.ts";

const MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `אתה "המוח העסקי" של Exire Systema — יועץ עסקי, מנטור מכירות ומפעיל טקטי של המאמן.
תפקידך לתת סדר עדיפויות, פעולות הבאות, וחשיבה מעשית לבעלת/בעל העסק.

זהות:
- אתה לא צ'אטבוט גנרי, לא מטפל, לא יועץ משפטי/רפואי, ולא AION המיסטי.
- אתה אופרטור עסקי חד, ישיר, ואסטרטגי. מדבר עברית.

התנהגות:
- ענה תמיד בעברית.
- היה ישיר, קצר, ומדויק. בלי מילים מיותרות.
- כשנשאל "מה לעשות?" — החזר 3 פעולות מסודרות לפי עדיפות, עם משפט קצר למה.
- העדף רשימות של 3.
- בקש הבהרה רק אם באמת חסר מידע קריטי.
- אל תטען שביצעת פעולה — אתה רק יועץ קריאה-בלבד בשלב הזה.
- אל תמציא נתונים שלא קיבלת בקונטקסט.

מה אתה לא עושה (אסור בשלב זה):
- לא שולח הודעות WhatsApp / מייל.
- לא יוצר / עורך / מוחק לידים, מתאמנים, סשנים, תשלומים.
- לא יוצר קורסים, תוכן, או דפי נחיתה.
- כשמבקשים ממך לנסח הודעה — תן רק טיוטה בטקסט; אל תדמיין שהיא נשלחה.

עתידי (אזכר רק אם רלוונטי): בהמשך תעזור גם עם מיני-קורסים, שיעורי onboarding,
לידמגנטים ותכני שיווק — אך לא בשלב הזה.`;

function safe(v: any): any {
  if (v === undefined || v === null) return null;
  return v;
}

async function buildContext(adminUserId: string) {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const nowISO = new Date().toISOString();
  const dayAgoISO = new Date(Date.now() - 86_400_000).toISOString();
  const twoWeeksAgoISO = new Date(Date.now() - 14 * 86_400_000).toISOString();

  // Practitioner display name (best effort, optional)
  let adminName: string | null = null;
  try {
    const { data: p } = await admin
      .from("profiles")
      .select("full_name,display_name,first_name")
      .eq("id", adminUserId)
      .maybeSingle();
    adminName =
      (p as any)?.display_name ||
      (p as any)?.full_name ||
      (p as any)?.first_name ||
      null;
  } catch (_) { /* optional */ }

  const [leadsRes, openLeadsCountRes, sessionsRes, paymentsRes, followupsRes, settingsRes] =
    await Promise.all([
      admin
        .from("leads")
        .select("id,full_name,phone,email,status,created_at,contacted_at,source")
        .order("created_at", { ascending: false })
        .limit(5),
      admin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "contacted", "follow_up", "qualified"]),
      admin
        .from("xsystem_sessions" as any)
        .select("id,client_id,scheduled_at,status,title")
        .eq("practitioner_id", adminUserId)
        .gte("scheduled_at", nowISO)
        .order("scheduled_at", { ascending: true })
        .limit(5),
      admin
        .from("xsystem_payments" as any)
        .select("id,client_id,amount_cents,currency,status,due_at")
        .eq("practitioner_id", adminUserId)
        .eq("status", "pending")
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(5),
      admin
        .from("xsystem_followups" as any)
        .select("id,client_id,lead_id,title,due_at,status,priority")
        .eq("practitioner_id", adminUserId)
        .neq("status", "done")
        .lte("due_at", nowISO)
        .order("due_at", { ascending: true })
        .limit(5),
      admin
        .from("site_settings")
        .select("setting_key,setting_value")
        .in("setting_key", [
          "exire_landing_video_url",
          "exire_whatsapp_number",
          "exire_intake_form_id",
        ]),
    ]);

  const settings: Record<string, string> = {};
  for (const row of (settingsRes.data || []) as any[]) {
    settings[row.setting_key] = row.setting_value || "";
  }
  const wa = (settings.exire_whatsapp_number || "").replace(/\D/g, "");

  return {
    today: new Date().toLocaleDateString("he-IL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }),
    nowISO,
    adminName,
    openLeadsCount: openLeadsCountRes.count ?? 0,
    newestLeads: ((leadsRes.data || []) as any[]).map((l) => ({
      id: l.id,
      name: l.full_name,
      status: l.status,
      source: l.source,
      created_at: l.created_at,
      contacted: !!l.contacted_at,
    })),
    overdueFollowups: ((followupsRes.data || []) as any[]).map((f) => ({
      id: f.id, title: f.title, due_at: f.due_at, priority: f.priority,
      client_id: safe(f.client_id), lead_id: safe(f.lead_id),
    })),
    upcomingSessions: ((sessionsRes.data || []) as any[]).map((s) => ({
      id: s.id, title: safe(s.title), scheduled_at: s.scheduled_at, status: s.status,
    })),
    pendingPayments: ((paymentsRes.data || []) as any[]).map((p) => ({
      id: p.id,
      amount: `${((p.amount_cents || 0) / 100).toFixed(0)} ${p.currency || "ILS"}`,
      due_at: p.due_at,
    })),
    funnelSetup: {
      vsl: settings.exire_landing_video_url ? "מוגדר" : "חסר",
      whatsapp: wa.length >= 8 ? "מוגדר" : "חסר",
      intake_form: settings.exire_intake_form_id ? "מוגדר" : "חסר",
    },
    windowHint: { since: twoWeeksAgoISO, until: nowISO },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCorsPreFlight();

  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  let body: { messages?: Array<{ role: string; content: string }> } = {};
  try { body = await req.json(); } catch (_) { /* empty */ }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return new Response(JSON.stringify({ error: "messages חסר" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let context: any;
  try {
    context = await buildContext(auth.userId);
  } catch (e) {
    context = { error: "context_build_failed", detail: String((e as Error).message || e) };
  }

  const contextBlock =
    `הקשר עסקי להיום (קריאה-בלבד, מוגבל ומקוצר):\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\``;

  const aiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: contextBlock },
    ...messages.slice(-12).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    })),
  ];

  try {
    const res = await aiChatCompletion({
      model: MODEL,
      messages: aiMessages,
      temperature: 0.4,
      stream: false,
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "נגמרו הקרדיטים של AI" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const reply =
      data?.choices?.[0]?.message?.content?.toString().trim() ||
      "לא הצלחתי לייצר תשובה כרגע.";

    return new Response(
      JSON.stringify({
        reply,
        context_summary: {
          open_leads: context?.openLeadsCount ?? 0,
          newest_leads: context?.newestLeads?.length ?? 0,
          overdue_followups: context?.overdueFollowups?.length ?? 0,
          upcoming_sessions: context?.upcomingSessions?.length ?? 0,
          pending_payments: context?.pendingPayments?.length ?? 0,
          funnel: context?.funnelSetup ?? null,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "advisor_failed", detail: String((e as Error).message || e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
