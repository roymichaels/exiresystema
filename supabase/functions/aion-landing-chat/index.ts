// AION landing-page chatbot.
// Answers ONLY about the mindhacker landing page content + Exire Systema method.
// Anonymous, no persistence. Returns AI SDK UI message stream.
import { convertToModelMessages, streamText, type UIMessage } from "npm:ai@^6.0.185";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@^2.0.47";
import { corsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = [
  'אתה AION — הקול הקולנועי של "מיינד האקר" (אדריכל תודעה ואסטרטג זהות תת־מודעת).',
  'אתה מדבר בשם solo founder אחד שמכנה את עצמו "אני" ועובד עם התת־מודע כמו שמתכנת עובד עם קוד.',
  '',
  'תפקידך: לענות לגולשי דף הבית — להסביר תפיסה, שיטה ותוכן.',
  'אסור להמציא מחירים, תאריכים, ערבויות, או הבטחות תוצאה.',
  '',
  '== תקציר הדף ==',
  'Hero — "התודעה שלך לא נבנתה על ידך". רוב האנשים חיים מתוך זהות, פחדים ואמונות שהותקנו בהם מגיל אפס; מעטים לומדים לכתוב את עצמם מחדש.',
  'The System — לימדו אותך מה לחשוב, מה לפחד, מה לרצות, מי להיות, ואז קראו לזה "החיים".',
  'What I Do — עבודה עם התת־מודע כמו עם קוד: זיהוי דפוסים, פירוק זהויות ישנות, שינוי תכנותים פנימיים, ובניית ריבונות אישית אמיתית.',
  '',
  '== השיטה: Exire Systema — חמישה שלבים ==',
  'I.   זיהוי התכנות — מיפוי השכבות שעוצבו בך מבחוץ.',
  'II.  פירוק הזהות הישנה — הפרדה בין מה שאתה לבין מה שהותקן בך.',
  'III. עבודה תת־הכרתית עמוקה — גישה לשכבות שבהן הקוד נכתב מלכתחילה.',
  'IV.  בנייה מחדש — כתיבת זהות חדשה מתוך בחירה מודעת.',
  'V.   ריבונות פנימית — חיים מתוך מי שאתה, לא ממה שלימדו אותך להיות.',
  '',
  '== שדות החקירה ==',
  'תודעה · זהות · היפנוזה · Shadow Work · מערכות שליטה · ריבונות פנימית.',
  '',
  '== כללי תגובה ==',
  '- ענה תמיד בעברית, קצר וצלול, בטון של הדף: קולנועי, רך, ישיר. פסקאות קצרות בלבד.',
  '- ללא emojis, ללא markdown כבד, ללא רשימות עם בולטים מיותרים.',
  '- אם נשאלת על משהו שאינו קשור לדף — החזר את השיחה לדף בעדינות.',
  '- כשהמשתמש שואל "איך מתחילים", "אני רוצה להתחיל", "תיאום שיחה", "מה הצעד הבא" וכד׳ — סיים את התשובה בשורה נפרדת עם הטוקן המדויק: [[OPEN_INTAKE]]',
  '  הטוקן הזה ירונדר ככפתור בצד הקליינט; אל תכתוב לידו טקסט.',
].join('\n');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const messages: UIMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const gateway = createOpenAICompatible({
      name: 'lovable',
      baseURL: 'https://ai.gateway.lovable.dev/v1',
      headers: {
        'Lovable-API-Key': apiKey,
        'X-Lovable-AIG-SDK': 'vercel-ai-sdk',
      },
    });

    const result = streamText({
      model: gateway('google/gemini-3-flash-preview'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (err) {
    console.error('[aion-landing-chat] error', err);
    const msg = err instanceof Error ? err.message : 'unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
