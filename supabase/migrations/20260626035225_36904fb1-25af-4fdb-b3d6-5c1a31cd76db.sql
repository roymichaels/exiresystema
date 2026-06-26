
CREATE TABLE IF NOT EXISTS public.xsystem_message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id UUID NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','email','internal')),
  category TEXT NOT NULL CHECK (category IN ('lead_reply','onboarding','followup','session_prep','post_session','payment','checkin','audio_assignment')),
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_message_templates TO authenticated;
GRANT ALL ON public.xsystem_message_templates TO service_role;

ALTER TABLE public.xsystem_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xsys_msg_templates_owner_all"
ON public.xsystem_message_templates
FOR ALL TO authenticated
USING (auth.uid() = practitioner_id)
WITH CHECK (auth.uid() = practitioner_id);

CREATE INDEX IF NOT EXISTS idx_xsys_msg_templates_practitioner
  ON public.xsystem_message_templates(practitioner_id, channel, category)
  WHERE is_archived = false;

CREATE TRIGGER update_xsys_msg_templates_updated_at
  BEFORE UPDATE ON public.xsystem_message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default Hebrew templates for every existing practitioner (and admin)
INSERT INTO public.xsystem_message_templates
  (practitioner_id, name, channel, category, subject, body, variables, is_default)
SELECT pid, t.name, t.channel, t.category, t.subject, t.body, t.variables, true
FROM (
  SELECT DISTINCT user_id AS pid FROM public.user_roles
   WHERE role IN ('admin','practitioner')
) p,
LATERAL (VALUES
  ('ליד חדש - הסבר על Exire Systema', 'whatsapp', 'lead_reply', NULL,
   'היי {{lead_name}}, כאן {{coach_name}} מ-Exire Systema 👋
קיבלתי את הפנייה שלך ואני שמח שיצרת קשר.
Exire Systema היא מערכת אישית שמלווה אותך תהליך עמוק לשינוי דפוסים, אמונות ופעולה.
מתי נוח לך לשיחת היכרות קצרה?',
   '["lead_name","coach_name"]'::jsonb),

  ('קביעת שיחת התאמה', 'whatsapp', 'lead_reply', NULL,
   'היי {{lead_name}}, בוא נקבע שיחת התאמה של 20 דקות.
איזה יום וזמן הכי נוחים לך השבוע?',
   '["lead_name"]'::jsonb),

  ('ברוך הבא - מתאמן חדש', 'whatsapp', 'onboarding', NULL,
   'ברוך הבא {{first_name}} 🙏
נרשמת רשמית ל-Exire Systema. הנה הצעדים הראשונים:
1. מילוי טופס קבלה: {{intake_link}}
2. נקבע יחד את הסשן הראשון
3. תקבל גישה להקלטה אישית ראשונה

מחכה לך,
{{coach_name}}',
   '["first_name","intake_link","coach_name"]'::jsonb),

  ('הכנה לפני סשן ראשון', 'whatsapp', 'session_prep', NULL,
   'היי {{first_name}}, מזכיר שיש לנו סשן בתאריך {{session_date}}.
לפני שאנחנו נפגשים, קח 10 דקות לכתוב:
- מה הכי מטריד אותך עכשיו
- מה היית רוצה שיהיה אחרת בעוד 90 יום

נתראה,
{{coach_name}}',
   '["first_name","session_date","coach_name"]'::jsonb),

  ('אחרי סשן - אינטגרציה', 'whatsapp', 'post_session', NULL,
   'היי {{first_name}}, היה סשן חזק היום 💪
שתי משימות לימים הקרובים:
1. להאזין להקלטה האישית
2. לרשום שינוי אחד שהבחנת בו

מדבר איתך בקרוב,
{{coach_name}}',
   '["first_name","coach_name"]'::jsonb),

  ('תזכורת צ׳ק-אין', 'whatsapp', 'checkin', NULL,
   'היי {{first_name}}, הגיע הזמן לצ׳ק-אין שבועי קצר.
איך אתה מרגיש השבוע? מה עבד ומה פחות?',
   '["first_name"]'::jsonb),

  ('תזכורת תשלום', 'whatsapp', 'payment', NULL,
   'היי {{first_name}}, רק תזכורת ידידותית - ממתין תשלום של {{amount}}.
תודה,
{{coach_name}}',
   '["first_name","amount","coach_name"]'::jsonb),

  ('שליחת הקלטה אישית', 'whatsapp', 'audio_assignment', NULL,
   'היי {{first_name}}, הנה ההקלטה האישית שהכנתי לך:
{{audio_link}}
מומלץ להאזין במקום שקט, פעם ביום למשך השבוע הקרוב.',
   '["first_name","audio_link"]'::jsonb),

  ('Onboarding email', 'email', 'onboarding', 'ברוך הבא ל-Exire Systema',
   '<div dir="rtl"><h2>ברוך הבא {{first_name}} 🙏</h2>
<p>נרשמת רשמית ל-Exire Systema. אני שמח שבחרת להיכנס לתהליך הזה.</p>
<p>הצעדים הראשונים:</p>
<ol><li>מילוי טופס קבלה: <a href="{{intake_link}}">לחץ כאן</a></li>
<li>נקבע יחד את הסשן הראשון שלך</li>
<li>תקבל גישה להקלטות אישיות</li></ol>
<p>מחכה לך,<br/>{{coach_name}}</p></div>',
   '["first_name","intake_link","coach_name"]'::jsonb)
) AS t(name, channel, category, subject, body, variables)
ON CONFLICT DO NOTHING;
