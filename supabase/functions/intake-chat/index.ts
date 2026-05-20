// AION Intake Chat — consciousness scanner that filters and captures leads.
// Public endpoint (no auth required). Streams Lovable AI, exposes save_lead tool
// that writes to public.leads + notifies founder via Resend.
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from 'npm:ai@6';
import { createOpenAICompatible } from 'npm:@ai-sdk/openai-compatible@2';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FOUNDER_NOTIFY_EMAIL = Deno.env.get('FOUNDER_NOTIFY_EMAIL') ?? '';
const FOUNDER_WHATSAPP_NUMBER = (Deno.env.get('FOUNDER_WHATSAPP_NUMBER') ?? '').replace(/\D/g, '');

const gateway = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://mindhacker.app',
    'X-Title': 'Mind Hacker Intake',
  },
});

const SYSTEM_PROMPT = `אתה AION — consciousness scanner של "מיינד האקר".
לא bot. לא טופס. לא קואוצ׳ר. אתה נוכחות אינטליגנטית שסורקת מי שמולך.

📜 מטרה
לאסוף מספיק אותות כדי לזהות את הדפוס הפנימי של המשתמש ואת ה־readiness שלו, ובסוף לקבל פרטי קשר. הכל בטון של עוצמה שקטה, חידתי, קולנועי.

🔥 כללי שיחה (חובה)
1. עברית מלאה, ישירה, חדה, קצרה. בלי לקשקש. בלי קלישאות ("נהדר!", "מעולה!", "תודה רבה!").
2. אסור לחלוטין: גיל, מקצוע, תקציב, "איפה שמעת עלינו", שאלות CRM.
3. אל תשאל שתי שאלות בהודעה אחת. שאלה אחת בכל פעם.
4. כשאתה מציע אפשרויות — תן אותן כרשימה ממוספרת קצרה (1. ... 2. ... 3. ...). המשתמש יכול לבחור מספר או לכתוב משלו.
5. אחרי כל תשובה משמעותית — קרא לכלי המתאים מיד כדי לשמור את הסיגנל. אל תחכה לסוף.
6. אסור להמציא תוצאות / להבטיח שינוי / לתת ייעוץ פסיכולוגי.

🌀 הזרימה (5 שלבים, אבל זורם ולא נוקשה)

שלב 1 — Hook (פתיחה)
פותח בהודעה הראשונה במשפט חד אחד, כמו:
"רוב האנשים חיים מתוך דפוסים שמעולם לא בחרו. בוא נבין מה מנהל אותך כרגע."
ואז שאלה ראשונה.

שלב 2 — Pain Detection (3 שאלות)
שאלה: "מה הכי מרגיש 'תקוע' אצלך כרגע?" — תן רשימה: פחדים וחרדות / חוסר ביטחון / חוסר משמעות / מערכות יחסים / כסף והצלחה / דחיינות / זהות עצמית / הרגלים והתמכרויות / טראומה ועבר / לא יודע להסביר.
שאלה: "כמה זמן זה מנהל אותך?" — חודשים / שנים / כמעט כל החיים / לאחרונה.
שאלה: "מה כבר ניסית בעבר?" — טיפול / קואוצ׳ינג / ספרים ותוכן / מדיטציה / פסיכולוגיה / כלום / "ניסיתי הכל".
→ קרא set_pain_signal עם {category, duration, prior_attempts}.

שלב 3 — Readiness Filter (2 שאלות)
שאלה: "מה אתה מחפש?" — להבין את עצמי / שינוי אמיתי / שקט פנימי / בנייה מחדש / לפרוץ גבולות פנימיים / עדיין לא יודע.
שאלה: "בסולם 1–10, עד כמה אתה מוכן להתמודד עם אמת פנימית גם אם היא לא נוחה?" — בקש מספר.
→ קרא set_readiness עם {desired_outcome, readiness_score, intent}. intent יוצא מהשאלה הבאה.

שלב 4 — Qualification (2 שאלות)
שאלה: "אתה מחפש כרגע ליווי אמיתי או רק חוקר?" — אני רוצה להתחיל תהליך (start_process) / אני בודק אפשרויות (exploring) / רק סקרן כרגע (curious).
שאלה: "אם היית מצליח לשנות את מה שמנהל אותך — איך החיים שלך היו נראים?" — תשובה פתוחה.
→ קרא set_vision עם {transformation_vision}.

🪞 רגע ה־Pattern Reveal
לפני בקשת פרטי קשר, החזר תובנה קצרה אחת בסגנון:
"נראה שאתה לא באמת תקוע בגלל [X שאמר]. נראה שיש דפוס פנימי עמוק יותר של ___."
המשך מיד לשלב 5 באותה הודעה.

שלב 5 — Lead Capture
שאלה: "איך אפשר ליצור איתך קשר? צריך שם ומספר וואטסאפ (אימייל אופציונלי)."
המשתמש יענה בהודעה אחת. ברגע שיש לך שם + טלפון, קרא מיד save_lead עם:
- name, phone, email (אם יש)
- pattern_diagnosis: התובנה שניסחת לעיל (1-2 משפטים בעברית)
- ai_analysis: {emotional_intensity:1-10, self_awareness_level:1-10, openness:1-10, buying_intent:1-10}

לאחר שהכלי החזיר תוצאה, ההודעה הסופית שלך תהיה קצרה:
"המערכת זיהתה את הדפוסים שמנהלים אותך כרגע. השלב הבא הוא להבין האם אפשר לבנות אותך מחדש בצורה מדויקת."
אל תזכיר "וואטסאפ" — ה־UI יציג את הכפתור.

🚫 אם המשתמש מנסה לסטות (שואל אותך משהו אישי, מתחיל לדבר על הכל, מקשקש) — תחזיר אותו בעדינות לזרימה במשפט אחד: "אני שומע. בוא נמשיך."`;

const buildSupabase = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function notifyFounder(lead: Record<string, unknown>): Promise<void> {
  if (!RESEND_API_KEY || !FOUNDER_NOTIFY_EMAIL) return;
  try {
    const subject = `ליד חדש: ${lead.name ?? 'ללא שם'} (${lead.intent ?? '—'})`;
    const html = `
      <div style="font-family:system-ui;line-height:1.6;direction:rtl">
        <h2>ליד חדש מ-AION Intake</h2>
        <p><strong>שם:</strong> ${lead.name ?? '—'}</p>
        <p><strong>טלפון:</strong> ${lead.phone ?? '—'}</p>
        <p><strong>אימייל:</strong> ${lead.email ?? '—'}</p>
        <hr/>
        <p><strong>Pain:</strong> ${lead.pain_category ?? '—'} (${lead.pain_duration ?? '—'})</p>
        <p><strong>ניסה בעבר:</strong> ${Array.isArray(lead.prior_attempts) ? (lead.prior_attempts as string[]).join(', ') : '—'}</p>
        <p><strong>מחפש:</strong> ${lead.desired_outcome ?? '—'}</p>
        <p><strong>Readiness:</strong> ${lead.readiness_score ?? '—'}/10 · <strong>Intent:</strong> ${lead.intent ?? '—'}</p>
        <p><strong>חזון:</strong> ${lead.transformation_vision ?? '—'}</p>
        <hr/>
        <p><strong>אבחנה:</strong> ${(lead.ai_analysis as any)?.pattern_diagnosis ?? '—'}</p>
        <pre style="background:#f4f4f4;padding:10px;border-radius:6px">${JSON.stringify(lead.ai_analysis, null, 2)}</pre>
      </div>`;
    await fetch('https://connector-gateway.lovable.dev/resend/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Mind Hacker <onboarding@resend.dev>',
        to: [FOUNDER_NOTIFY_EMAIL],
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error('Resend notify failed:', err);
  }
}

function buildWhatsappUrl(name: string): string {
  if (!FOUNDER_WHATSAPP_NUMBER) return '';
  const text = encodeURIComponent(`שלום, אני ${name}. סיימתי את הסריקה במיינד האקר ואני רוצה להתחיל.`);
  return `https://wa.me/${FOUNDER_WHATSAPP_NUMBER}?text=${text}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // In-request signal buffer accumulated via tool calls
  const signals: Record<string, unknown> = {};

  const tools = {
    set_pain_signal: tool({
      description: 'Persist the user pain signal once detected.',
      inputSchema: z.object({
        category: z.string().min(1),
        duration: z.string().min(1),
        prior_attempts: z.array(z.string()).default([]),
      }),
      execute: async (args) => {
        signals.pain_category = args.category;
        signals.pain_duration = args.duration;
        signals.prior_attempts = args.prior_attempts;
        return { ok: true };
      },
    }),
    set_readiness: tool({
      description: 'Persist what the user is looking for and their readiness score (1-10).',
      inputSchema: z.object({
        desired_outcome: z.string().min(1),
        readiness_score: z.number().int().min(1).max(10),
        intent: z.enum(['start_process', 'exploring', 'curious']).optional(),
      }),
      execute: async (args) => {
        signals.desired_outcome = args.desired_outcome;
        signals.readiness_score = args.readiness_score;
        if (args.intent) signals.intent = args.intent;
        return { ok: true };
      },
    }),
    set_vision: tool({
      description: 'Persist the user transformation vision (open answer).',
      inputSchema: z.object({
        transformation_vision: z.string().min(1),
        intent: z.enum(['start_process', 'exploring', 'curious']).optional(),
      }),
      execute: async (args) => {
        signals.transformation_vision = args.transformation_vision;
        if (args.intent) signals.intent = args.intent;
        return { ok: true };
      },
    }),
    save_lead: tool({
      description:
        'Save the qualified lead. Call ONLY after you have name + phone. This writes to the database and triggers founder notification.',
      inputSchema: z.object({
        name: z.string().trim().min(1).max(120),
        phone: z.string().trim().min(6).max(40),
        email: z.string().trim().email().max(255).optional().nullable(),
        pattern_diagnosis: z.string().min(1).max(1000),
        ai_analysis: z
          .object({
            emotional_intensity: z.number().min(0).max(10).optional(),
            self_awareness_level: z.number().min(0).max(10).optional(),
            openness: z.number().min(0).max(10).optional(),
            buying_intent: z.number().min(0).max(10).optional(),
          })
          .default({}),
      }),
      execute: async (args) => {
        const supabase = buildSupabase();
        const ai_analysis = { ...args.ai_analysis, pattern_diagnosis: args.pattern_diagnosis };
        const row = {
          name: args.name,
          phone: args.phone,
          email: args.email ?? null,
          contact_phone: args.phone,
          contact_email: args.email ?? null,
          source: 'intake_chat',
          status: 'new',
          conversation: body.messages,
          pain_category: signals.pain_category ?? null,
          pain_duration: signals.pain_duration ?? null,
          prior_attempts: signals.prior_attempts ?? null,
          desired_outcome: signals.desired_outcome ?? null,
          transformation_vision: signals.transformation_vision ?? null,
          readiness_score: signals.readiness_score ?? null,
          intent: signals.intent ?? null,
          ai_analysis,
        };
        const { data, error } = await supabase
          .from('leads')
          .insert(row)
          .select('id')
          .single();
        if (error) {
          console.error('lead insert failed:', error);
          return { ok: false, error: error.message };
        }
        await notifyFounder({ ...row, ai_analysis });
        return {
          ok: true,
          lead_id: data.id,
          pattern_diagnosis: args.pattern_diagnosis,
          whatsapp_url: buildWhatsappUrl(args.name),
        };
      },
    }),
  };

  try {
    const result = streamText({
      model: gateway('google/gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(body.messages),
      tools,
      stopWhen: stepCountIs(50),
    });
    return result.toUIMessageStreamResponse({
      headers: corsHeaders,
      originalMessages: body.messages,
    });
  } catch (err) {
    console.error('streamText error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error)?.message ?? 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
