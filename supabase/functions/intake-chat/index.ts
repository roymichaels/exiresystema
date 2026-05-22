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

const SYSTEM_PROMPT = `אתה AION — נוכחות שקטה שקוראת את העולם הפנימי של מי שמולך.
לא בוט. לא מאמן. לא מטפל. לא טופס. אתה מראה שמשקפת.

🎯 המטרה האמיתית
לא לאסוף מידע — לגרום למשתמש להרגיש שמישהו סוף סוף רואה אותו.
תוך כדי, אתה אוסף בשקט את האותות שאתה צריך, וכשמגיע הרגע — מבקש דרך ליצור קשר.

🗣️ קול
- עברית מודרנית, רכה, מדויקת. שורה אחת או שתיים. לא יותר.
- שתיקות מותרות. אסור לפטפט.
- אסור לחלוטין: "מעולה", "תודה רבה!", "וואו", סימני קריאה מיותרים, אימוג'ים, קלישאות מאמני חיים.
- אסור לשאול שתי שאלות באותה הודעה.
- אסור לכתוב 1. 2. 3. בטקסט. אם אתה מציע אפשרויות — חובה לקרוא לכלי offer_choices.
- אסור: גיל, מקצוע, תקציב, איפה שמעת עלינו, שאלות CRM כלשהן.

💰 מחיר (רק אם המשתמש שואל ישירות על מחיר/עלות/כמה זה עולה)
- פגישת ליווי אישית: 500₪ לשעה.
- ענה בקצרה, בלי למכור, בלי הנחות, בלי לפרט חבילות. משפט אחד יבש ואז חוזרים לשיחה.
- אל תזכיר מחיר ביוזמתך. לא בפתיחה, לא בסיום, לא ברפלקציה.

🌬️ קצב
- שאלות ארכיטיפיות, רגשיות, קצרות. לא קליניות.
- במקום "מה הכי תקוע אצלך?" → "מה ממשיך לחזור, גם כשאתה מנסה להשתנות?"
- במקום "בחר תחום בחיים" → "מה מרגיש הכי מוכר לאחרונה?"
- במקום "בסולם 1-10, עד כמה אתה מוכן?" → "כשאתה מדמיין שינוי אמיתי — איזה חלק בך נרתע?"

🪞 מראה (חשוב!)
פעם בכל 2-3 תשובות של המשתמש — לפני השאלה הבאה — קרא לכלי reflect עם משפט אחד שמשקף בעדינות מה שזיהית.
לדוגמה: "נראה שאתה לא באמת מחפש מוטיבציה. נראה שאתה מנסה להבין למה שום שינוי לא מחזיק."
לא לפרש יתר על המידה. לא לאבחן. רק לשקף.

🔢 אפשרויות (תמיד דרך offer_choices)
4–5 אפשרויות מקסימום. ארכיטיפיות, רגשיות, קצרות (2-4 מילים). לא תוויות CRM.
דוגמה לתחושות מוכרות: "ריקנות שקטה" / "רעש פנימי" / "אני לא אני" / "תקיעות שחוזרת" / "משהו אחר".

🌀 השלבים (סמויים, לעולם לא להזכיר אותם)
0. ההודעה הראשונה של המשתמש היא תמיד טריגר להתחלה — לא תוכן. תתעלם מהמילים שלה ופתח ב-Echo.
1. Echo — הודעה ראשונה שלך: משפט פתיחה אחד + שאלה ראשונה רגשית. בלי הקדמות.
   דוגמה לפתיחה: "רוב האנשים חיים מתוך דפוסים שמעולם לא בחרו." ואז שאלה.
2. Loop — מה חוזר. קרא set_pain_signal ברגע שיש לך category + duration.
3. Identity — מי הוא חושב שהוא לעומת מי שהוא מרגיש שהוא. קרא set_vision כשמופיע חזון.
4. Depth — לפני Readiness, חובה לברר מה הוא בעצם מחפש כאן. שאלה אחת רכה, ארכיטיפית, עם offer_choices:
   prompt לדוגמה: "מה אתה מחפש כאן באמת?"
   options לדוגמה: "הקלה רגעית" / "פריצה אחת" / "תהליך עומק" / "ליווי ארוך טווח" / "רק לבדוק" / "עדיין לא יודע".
   ברגע שיש תשובה — קרא set_readiness או set_vision עם השדה change_depth המתאים
   (momentary / breakthrough / deep_process / long_term / exploring / unsure).
   אסור לדלג על השלב הזה — בלעדיו אסור לבקש פרטי קשר.
5. Readiness — מה ירתע אם השינוי יקרה באמת. קרא set_readiness (תרגם תשובה רגשית ל-1-10 בעצמך).
6. Contact — חובה. רק אחרי שיש pain + change_depth + (readiness או vision):
   א. קרא ל-request_contact עם משפט קצר אחד (sentence) כמו: "אם אתה רוצה שאחזור אליך עם מה שזיהיתי — תשאיר שם ומספר וואטסאפ." זה יציג למשתמש שדות קלט של שם וטלפון.
   ב. אל תכתוב טקסט נוסף אחרי request_contact. תחכה בשקט להודעה הבאה של המשתמש.
   ג. כשתגיע ההודעה הבאה (היא תכיל "שמי X, הטלפון שלי Y") — קרא מיד ל-save_lead עם pattern_diagnosis (משפט אחד חד בעברית) ו-ai_analysis. אל תשאל שוב.
   אסור להשתמש ב-offer_choices לאיסוף שם/טלפון. אסור לבקש שם/טלפון בטקסט חופשי — רק דרך request_contact.

🔒 חוקי סיום קשיחים (חשוב מאוד):
- אסור בהחלט לכתוב את המילים "זיהיתי", "השלב הבא", "סיימנו", "תודה שהשתתפת", או כל ניסוח של סגירה/סיכום — לפני ש-save_lead החזיר {ok:true}.
- אחרי save_lead מוצלח — תשתוק לחלוטין. אל תכתוב טקסט נוסף. ה-UI מציג את מסך הסיום והכפתור.
- אם save_lead החזיר {ok:false} — אל תזייף הצלחה. תמשיך את השיחה רגיל, השלם את מה שחסר, ונסה שוב.

🚫 אם המשתמש סוטה / שואל אותך משהו / מקשקש — שורה אחת רכה: "אני כאן. תחזור רגע." ואז השאלה הבאה.`;

const buildSupabase = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function flattenTranscript(messages: UIMessage[]): Array<{ role: string; text: string }> {
  const out: Array<{ role: string; text: string }> = [];
  for (const m of messages ?? []) {
    const role = (m as any)?.role;
    if (role !== 'user' && role !== 'assistant') continue;
    let text = '';
    if (typeof (m as any).content === 'string') text = (m as any).content;
    else if (Array.isArray((m as any).parts)) {
      text = (m as any).parts
        .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
        .filter(Boolean)
        .join(' ')
        .trim();
    }
    if (text) out.push({ role, text });
  }
  return out;
}

async function analyzeConversationDeep(
  messages: UIMessage[],
  signals: Record<string, unknown>,
  shortDiagnosis: string,
  language: 'he' | 'en' | 'es',
): Promise<Record<string, unknown> | null> {
  if (!LOVABLE_API_KEY) {
    console.warn('analyzeConversationDeep skipped: LOVABLE_API_KEY missing');
    return null;
  }
  const transcript = flattenTranscript(messages);
  const transcriptText = transcript.map((t) => `${t.role.toUpperCase()}: ${t.text}`).join('\n');

  const sysHe = `אתה אנליסט בכיר של פסיכולוגיית עומק ודפוסי שינוי. אתה מקבל תמלול מלא של שיחת אינטייק.
תפקידך: לקרוא את כל השיחה ולחלץ את האמת מתחת לפני השטח — לא מה שהמשתמש אמר, אלא מה שבאמת קורה.

עקרונות:
- "יוגה" או כל דוגמה ספציפית שהמשתמש הזכיר הם תוכן פני שטח — לא הבעיה האמיתית.
- חפש את הדפוס החוזר, ההתחמקות, הסתירות בין מה שהוא רוצה למה שהוא עושה, מה שהוא לא אמר.
- אסור קלישאות מאמני חיים, אסור "מעולה", "מדהים", "צמיחה".
- הצלב אותות: משך הקושי, ניסיונות עבר, רמת מוכנות שהצהיר עליה לעומת שפת ההתחמקות.
- האבחנה הקצרה שה-AI כתב במהלך השיחה היא רק רמז — אתה רשאי לסתור אותה.

החזר תוצאה רק דרך הכלי emit_lead_report. שפה: עברית מודרנית, חדה, ללא שטויות.`;

  const sysEn = sysHe
    .replace('עברית מודרנית', 'natural English')
    .replace('אסור קלישאות מאמני חיים', 'No life-coach clichés')
    .replace('"מעולה", "מדהים", "צמיחה"', '"awesome", "amazing", "growth"');

  const sysEs = sysHe
    .replace('עברית מודרנית', 'español natural')
    .replace('אסור קלישאות מאמני חיים', 'Sin clichés de coaching');

  const system = language === 'en' ? sysEn : language === 'es' ? sysEs : sysHe;

  const userPayload = [
    `== SIGNALS ==`,
    JSON.stringify(signals, null, 2),
    ``,
    `== SHORT DIAGNOSIS FROM IN-CHAT AI (challenge if shallow) ==`,
    shortDiagnosis || '(none)',
    ``,
    `== FULL TRANSCRIPT ==`,
    transcriptText || '(empty)',
  ].join('\n');

  const tool = {
    type: 'function',
    function: {
      name: 'emit_lead_report',
      description: 'Emit the deep analyst report.',
      parameters: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          stated_problem: { type: 'string' },
          real_problem: { type: 'string' },
          recurring_pattern: { type: 'string' },
          avoidance: { type: 'string' },
          contradictions: { type: 'array', items: { type: 'string' }, maxItems: 3 },
          archetype: { type: 'string' },
          readiness_read: { type: 'string' },
          recommended_opening: { type: 'string' },
          risk_flags: { type: 'array', items: { type: 'string' }, maxItems: 3 },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
        },
        required: [
          'headline', 'stated_problem', 'real_problem', 'recurring_pattern',
          'avoidance', 'archetype', 'readiness_read', 'recommended_opening', 'confidence',
        ],
        additionalProperties: false,
      },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPayload },
        ],
        tools: [tool],
        tool_choice: { type: 'function', function: { name: 'emit_lead_report' } },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('deep analyst gateway error:', res.status, t);
      return null;
    }
    const data = await res.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const raw = call?.function?.arguments;
    if (!raw) {
      console.warn('deep analyst: no tool call returned');
      return null;
    }
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      console.error('deep analyst: failed to parse arguments', e, raw);
      return null;
    }
  } catch (err) {
    console.error('deep analyst failed:', err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function renderTranscriptHtml(messages: UIMessage[]): string {
  const turns = flattenTranscript(messages);
  if (!turns.length) return '<p>—</p>';
  return turns
    .map((t) => {
      const label = t.role === 'user' ? 'משתמש' : 'AION';
      const bg = t.role === 'user' ? '#eef5ff' : '#f5f0ff';
      return `<div style="background:${bg};border-radius:8px;padding:8px 12px;margin:6px 0"><strong>${label}:</strong> ${esc(t.text)}</div>`;
    })
    .join('');
}

async function notifyFounder(lead: Record<string, unknown>, messages: UIMessage[]): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('notifyFounder skipped: RESEND_API_KEY missing');
    return;
  }
  if (!FOUNDER_NOTIFY_EMAIL) {
    console.warn('notifyFounder skipped: FOUNDER_NOTIFY_EMAIL missing');
    return;
  }
  try {
    const ai = (lead.ai_analysis as any) ?? {};
    const deep = ai.deep_report as Record<string, any> | null | undefined;
    const subject = `ליד חדש: ${lead.name ?? 'ללא שם'} — ${deep?.headline ?? ai.pattern_diagnosis ?? lead.intent ?? '—'}`;

    const deepBlock = deep
      ? `
        <h3 style="margin:24px 0 8px">🧠 הקריאה העמוקה</h3>
        <p style="font-size:16px;background:#fff7e6;padding:10px 14px;border-right:3px solid #d97706;border-radius:6px"><strong>${esc(deep.headline)}</strong></p>
        <p><strong>מה שהוא אמר:</strong> ${esc(deep.stated_problem)}</p>
        <p><strong>מה שבאמת קורה:</strong> ${esc(deep.real_problem)}</p>
        <p><strong>דפוס חוזר:</strong> ${esc(deep.recurring_pattern)}</p>
        <p><strong>ממה הוא מתחמק:</strong> ${esc(deep.avoidance)}</p>
        ${Array.isArray(deep.contradictions) && deep.contradictions.length ? `<p><strong>סתירות:</strong></p><ul>${deep.contradictions.map((c: string) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
        <p><strong>ארכיטיפ:</strong> ${esc(deep.archetype)}</p>
        <p><strong>קריאת מוכנות:</strong> ${esc(deep.readiness_read)}</p>
        ${Array.isArray(deep.risk_flags) && deep.risk_flags.length ? `<p><strong>דגלי סיכון:</strong> ${deep.risk_flags.map((r: string) => esc(r)).join(' · ')}</p>` : ''}
        <p><strong>איך לפתוח את השיחה:</strong></p>
        <p style="background:#ecfdf5;padding:10px 14px;border-right:3px solid #059669;border-radius:6px;font-style:italic">${esc(deep.recommended_opening)}</p>
        <p style="font-size:12px;color:#888">ביטחון אנליסט: ${deep.confidence ?? '—'}</p>
      `
      : `<p style="color:#b91c1c"><em>הקריאה העמוקה לא נוצרה (timeout / error). ראה אבחנה קצרה למטה.</em></p>`;

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;direction:rtl;max-width:640px;margin:0 auto;color:#111">
        <h2 style="margin:0 0 4px">ליד חדש מ-AION Intake</h2>
        <p style="color:#666;margin:0 0 16px">${esc(lead.name)} · ${esc(lead.phone)}${lead.email ? ` · ${esc(lead.email)}` : ''}</p>

        ${deepBlock}

        <h3 style="margin:24px 0 8px">📋 חתימת שיחה</h3>
        <p><strong>Pain:</strong> ${esc(lead.pain_category)} (${esc(lead.pain_duration)})</p>
        <p><strong>ניסה בעבר:</strong> ${Array.isArray(lead.prior_attempts) ? (lead.prior_attempts as string[]).map(esc).join(', ') : '—'}</p>
        <p><strong>מחפש:</strong> ${esc(lead.desired_outcome)}</p>
        <p><strong>Readiness:</strong> ${esc(lead.readiness_score)}/10 · <strong>Intent:</strong> ${esc(lead.intent)} · <strong>עומק שינוי:</strong> ${esc(ai.change_depth)}</p>
        <p><strong>חזון:</strong> ${esc(lead.transformation_vision)}</p>
        <p><strong>אבחנה מקורית (AI בזמן אמת):</strong> ${esc(ai.pattern_diagnosis)}</p>

        <h3 style="margin:24px 0 8px">💬 תמלול שיחה</h3>
        ${renderTranscriptHtml(messages)}

        <details style="margin-top:24px">
          <summary style="cursor:pointer;color:#666">JSON גולמי</summary>
          <pre style="background:#f4f4f4;padding:10px;border-radius:6px;direction:ltr;overflow:auto">${esc(JSON.stringify(lead.ai_analysis, null, 2))}</pre>
        </details>
      </div>`;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Mind Hacker <onboarding@resend.dev>',
        to: [FOUNDER_NOTIFY_EMAIL],
        subject,
        html,
      }),
    });
    const data = await res.json().catch(() => ({}));
    console.log('notifyFounder resend response:', {
      status: res.status,
      id: (data as any)?.id,
      error: (data as any)?.message,
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

function messageText(message: any): string {
  if (!message) return '';
  if (typeof message.content === 'string') return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .map((part: any) => (typeof part?.text === 'string' ? part.text : typeof part?.content === 'string' ? part.content : ''))
      .join(' ')
      .trim();
  }
  return '';
}

function latestUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if ((messages[i] as any)?.role === 'user') return messageText(messages[i]);
  }
  return '';
}

function inferContactFromText(text: string): { name?: string; phone?: string } {
  const phoneMatch = text.match(/(?:\+?\d[\d\s().-]{5,}\d|\d{6,})/);
  const phone = phoneMatch?.[0]?.trim();
  const withoutPhone = text
    .replace(/(?:\+?\d[\d\s().-]{5,}\d|\d{6,})/g, ' ')
    .replace(/[+:,;|/\\()[\]{}<>"'`~!@#$%^&*_=?\d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cleaned = withoutPhone
    .replace(/^(שמי|השם שלי|אני|my name is|name|שם)\s*[:\-]?\s*/i, '')
    .replace(/\s+(הטלפון שלי|הטלפון|טלפון|וואטסאפ|phone|whatsapp).*$/i, '')
    .trim();
  const name = cleaned.split(' ').filter((token) => token.length >= 2).slice(0, 3).join(' ');
  return { name: name || undefined, phone };
}

/**
 * Recover signals from prior tool calls in conversation history so save_lead
 * preconditions survive across requests (the in-memory `signals` resets each turn).
 */
function recoverSignalsFromHistory(messages: UIMessage[]): Record<string, unknown> {
  const recovered: Record<string, unknown> = {};
  for (const m of messages ?? []) {
    if ((m as any)?.role !== 'assistant') continue;
    const parts = (m as any).parts ?? [];
    for (const p of parts) {
      const typeStr: string = typeof p?.type === 'string' ? p.type : '';
      const toolName = typeStr.startsWith('tool-') ? typeStr.slice(5) : p?.toolName;
      const input = p?.input ?? p?.args ?? null;
      if (!toolName || !input) continue;
      if (toolName === 'set_pain_signal') {
        if (input.category) recovered.pain_category = input.category;
        if (input.duration) recovered.pain_duration = input.duration;
        if (Array.isArray(input.prior_attempts)) recovered.prior_attempts = input.prior_attempts;
      } else if (toolName === 'set_readiness') {
        if (input.desired_outcome) recovered.desired_outcome = input.desired_outcome;
        if (typeof input.readiness_score === 'number') recovered.readiness_score = input.readiness_score;
        if (input.intent) recovered.intent = input.intent;
        if (input.change_depth) recovered.change_depth = input.change_depth;
      } else if (toolName === 'set_vision') {
        if (input.transformation_vision) recovered.transformation_vision = input.transformation_vision;
        if (input.intent && !recovered.intent) recovered.intent = input.intent;
        if (input.change_depth && !recovered.change_depth) recovered.change_depth = input.change_depth;
      }
    }
  }
  return recovered;
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
    offer_choices: tool({
      description:
        'Render archetypal quick-reply chips for the user. Use this whenever you would otherwise list 1. 2. 3. options in text. Max 5 options, 2-4 words each.',
      inputSchema: z.object({
        prompt: z.string().min(1).max(200).optional(),
        options: z.array(z.string().min(1).max(40)).min(2).max(5),
        allow_freeform: z.boolean().default(true),
      }),
      execute: async (args) => args,
    }),
    reflect: tool({
      description:
        'Mirror back one short insight to the user before the next question. Use every 2-3 user turns. One sentence in Hebrew, no diagnosis.',
      inputSchema: z.object({
        insight: z.string().min(1).max(280),
      }),
      execute: async (args) => args,
    }),
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
        change_depth: z
          .enum(['momentary', 'breakthrough', 'deep_process', 'long_term', 'exploring', 'unsure'])
          .optional(),
      }),
      execute: async (args) => {
        signals.desired_outcome = args.desired_outcome;
        signals.readiness_score = args.readiness_score;
        if (args.intent) signals.intent = args.intent;
        if (args.change_depth) signals.change_depth = args.change_depth;
        return { ok: true };
      },
    }),
    set_vision: tool({
      description: 'Persist the user transformation vision (open answer).',
      inputSchema: z.object({
        transformation_vision: z.string().min(1),
        intent: z.enum(['start_process', 'exploring', 'curious']).optional(),
        change_depth: z
          .enum(['momentary', 'breakthrough', 'deep_process', 'long_term', 'exploring', 'unsure'])
          .optional(),
      }),
      execute: async (args) => {
        signals.transformation_vision = args.transformation_vision;
        if (args.intent) signals.intent = args.intent;
        if (args.change_depth) signals.change_depth = args.change_depth;
        return { ok: true };
      },
    }),
    request_contact: tool({
      description:
        'Render a name + phone input form to the user. Call this exactly once during step 6 (Contact) after pain + readiness/vision have been collected. After calling this tool, stay silent — do not write any text. Wait for the user response which will contain name and phone in a structured form like "שמי X, הטלפון שלי Y", then call save_lead immediately.',
      inputSchema: z.object({
        sentence: z.string().min(1).max(240).describe('One short sentence shown above the inputs explaining why you are asking.'),
      }),
      execute: async (args) => ({ ok: true, sentence: args.sentence }),
    }),
    save_lead: tool({
      description:
        'Save the qualified lead. PRECONDITIONS — do NOT call unless ALL are true: (a) set_pain_signal has already run in this conversation, (b) set_readiness OR set_vision has already run, (c) the most recent user message contains BOTH a human name of 2+ characters and a phone number with at least 6 total digits. Hebrew names like "דין" are valid. International numbers with + like "+525612966383" are valid. If any precondition is missing, keep asking instead of calling this tool. Calling without preconditions will return {ok:false} and the conversation will continue.',
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
        // Merge with signals recovered from message history (survives across requests).
        const recovered = recoverSignalsFromHistory(body.messages ?? []);
        for (const [k, v] of Object.entries(recovered)) {
          if (signals[k] === undefined || signals[k] === null) signals[k] = v;
        }

        const inferredContact = inferContactFromText(latestUserText(body.messages ?? []));
        // Prefer inferred phone (real digits from the user) over whatever the AI sent.
        const phone = (inferredContact.phone || args.phone || '').trim();
        // Prefer inferred name; reject AI-supplied "name" that's just digits/+.
        const argNameLooksLikePhone = /^[+\d\s().-]+$/.test((args.name || '').trim());
        const name = (
          inferredContact.name ||
          (argNameLooksLikePhone ? '' : args.name) ||
          ''
        ).trim();

        if (!signals.pain_category && !signals.transformation_vision) {
          console.warn('save_lead rejected: missing pain/vision signals');
          return { ok: false, error: 'precondition_failed: missing pain or vision signals — keep asking' };
        }
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 6) {
          console.warn('save_lead rejected: invalid phone', phone);
          return { ok: false, error: 'invalid_phone: ask the user for a real phone number' };
        }
        if (name.length < 2) {
          return { ok: false, error: 'invalid_name: ask the user for their name' };
        }

        const supabase = buildSupabase();
        const ai_analysis = {
          ...args.ai_analysis,
          pattern_diagnosis: args.pattern_diagnosis,
          change_depth: signals.change_depth ?? null,
        };
        const row = {
          name,
          phone,
          email: args.email ?? null,
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
          whatsapp_url: buildWhatsappUrl(name),
        };
      },
    }),
  };

  try {
    const language: 'he' | 'en' | 'es' =
      (body as any)?.language === 'en' || (body as any)?.language === 'es'
        ? (body as any).language
        : 'he';
    const languageDirective =
      language === 'en'
        ? '\n\n== LANGUAGE OVERRIDE (HIGHEST PRIORITY) ==\nIgnore any previous instruction to reply in Hebrew. Respond ONLY in English, regardless of the language of the user message. Keep the same quiet, mirroring, archetypal tone. Short lines. Translate every reflection, choice, and question to natural English. Apply this to every tool argument too (offer_choices.options, reflect.insight, pattern_diagnosis, ai_analysis).'
        : language === 'es'
        ? '\n\n== ANULACIÓN DE IDIOMA (MÁXIMA PRIORIDAD) ==\nIgnora cualquier instrucción previa de responder en hebreo. Responde SOLO en español, sin importar el idioma del mensaje del usuario. Mantén el mismo tono silencioso, reflexivo y arquetípico. Líneas cortas. Traduce todas las reflexiones, opciones y preguntas al español natural. Aplica esto también a cada argumento de herramienta (offer_choices.options, reflect.insight, pattern_diagnosis, ai_analysis).'
        : '';

    const result = streamText({
      model: gateway('google/gemini-2.5-flash'),
      system: SYSTEM_PROMPT + languageDirective,
      messages: await convertToModelMessages(body.messages),
      tools,
      stopWhen: stepCountIs(50),
    });
    return (result.toUIMessageStreamResponse as any)({
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
