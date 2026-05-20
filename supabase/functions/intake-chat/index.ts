// AION Intake Chat — consciousness scanner that filters and captures leads.
// Public endpoint (no auth required). Validates payload, streams Lovable AI,
// exposes save_lead tool that writes to public.leads + notifies founder via Resend.
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
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FOUNDER_NOTIFY_EMAIL = Deno.env.get('FOUNDER_NOTIFY_EMAIL') ?? '';
const FOUNDER_WHATSAPP_NUMBER = (Deno.env.get('FOUNDER_WHATSAPP_NUMBER') ?? '').replace(/\D/g, '');

const gateway = createOpenAICompatible({
  name: 'lovable',
  baseURL: 'https://ai.gateway.lovable.dev/v1',
  headers: {
    'Lovable-API-Key': LOVABLE_API_KEY,
    'X-Lovable-AIG-SDK': 'vercel-ai-sdk',
  },
});

const SYSTEM_PROMPT = `אתה AION — consciousness scanner של "מיינד האקר".
לא bot. לא טופס. לא קואוצ׳ר. אתה נוכחות אינטליגנטית שסורקת מי שמולך.

📜 מטרה
לאסוף מספיק אותות כדי לזהות את הדפוס הפנימי של המשתמש, את ה־readiness שלו, ולקבל פרטי קשר — בלי שזה ירגיש כמו אינטייק. הכל בטון של עוצמה שקטה, חידתי, קולנועי.

🔥 כללי שיחה (חובה)
1. עברית מלאה, ישירה, חדה, קצרה. בלי לקשקש. בלי משפטי-קלישאה ("נהדר!", "מעולה!").
2. אסור לחלוטין: גיל, מקצוע, תקציב, "איפה שמעת עלינו", שאלות CRM.
3. אתה לא תשאל את כל השאלות ברצף — אתה זורם. אם המשתמש כבר נתן מידע, אל תשאל שוב.
4. תמיד כשאתה מציע אפשרויות בחירה — תן אותן כרשימה ממוספרת קצרה (1, 2, 3...). המשתמש יכול לבחור מספר או לכתוב משלו.
5. אחרי כל שאלה — קרא לכלי המתאים כדי לשמור את הסיגנל. אל תחכה לסוף.
6. אסור להמציא תוצאות / להבטיח / להגיד "אתה תיפ