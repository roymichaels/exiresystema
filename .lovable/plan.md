
# Intake Chat — Consciousness Scanner (לא טופס)

מחליף את `smartNavigate()` ב-CTA. פותח מודאל פולסקרין קולנועי מעל הלנדינג, בו AION מנהל שיחה זורמת בעברית שמסננת ומאספת ליד. שמירה רק כשיש שם+טלפון. הקוד הישן של onboarding נזרק לגמרי.

## 1. סקרטים חסרים (לפני בנייה)

לפני שאני בונה אני צריך שתאשר/תספק:
- `RESEND_API_KEY` — להתראת מייל אליך (אתה אמרת שכן)
- `FOUNDER_NOTIFY_EMAIL` — לאן לשלוח את ההתראה כשנכנס ליד
- `FOUNDER_WHATSAPP_NUMBER` — מספר ב-E.164 (למשל `972501234567`) שאליו ה-`wa.me` link מפנה את הליד בסוף

(אבקש דרך add_secret ברגע שתאשר את התוכנית)

## 2. סכמת DB — טבלת `leads`

```text
leads
├── id, created_at, updated_at
├── name TEXT NOT NULL
├── contact_phone TEXT       — וואטסאפ/טלפון
├── contact_email TEXT
├── conversation JSONB       — מערך ההודעות המלא (UIMessage[])
├── pain_category TEXT       — מה שזיהה ה-AI (פחדים/דחיינות/...)
├── pain_duration TEXT       — חודשים/שנים/כל החיים
├── prior_attempts TEXT[]    — מה ניסה בעבר
├── desired_outcome TEXT     — מה מחפש
├── transformation_vision TEXT — תשובה פתוחה: איך החיים היו נראים
├── readiness_score INT      — 1-10 (מהסליידר)
├── intent TEXT              — start_process | exploring | curious
├── ai_analysis JSONB        — { emotional_intensity, self_awareness_level, openness, buying_intent, pattern_diagnosis }
└── status TEXT DEFAULT 'new' — new | contacted | converted | dismissed
```

**RLS:**
- INSERT: כל אחד (anonymous), כדי שהפונקציה תוכל ליצור ליד גם לא-מחובר. ולידציה בצד השרת (edge function) מגבילה את זה.
- SELECT/UPDATE/DELETE: רק `has_role(auth.uid(),'admin')`

## 3. Edge function — `supabase/functions/intake-chat/index.ts`

- public (`verify_jwt = false`) — חייב לעבוד למבקרים אנונימיים
- מקבל `{ messages: UIMessage[] }`, מפעיל `streamText` עם Lovable AI Gateway, מודל `google/gemini-3-flash-preview`
- `system` prompt בעברית שמגדיר את AION כ-**consciousness scanner** (לא bot, לא טופס) — מנחה לעבור 5 שלבים (Hook→Pain→Readiness→Qualification→Lead Capture) באופן שיחתי, קצר וחד
- **כללים בפרומפט:** אסור לשאול גיל/מקצוע/תקציב/"איפה שמעת". מותר להציע בחירות כשורות-טקסט בעברית. בסיום השלבים מחזיר תובנת-Pattern ("נראה שאתה לא תקוע בגלל X, אלא דפוס של ___")
- **Tools (AI SDK `tool()`):**
  - `set_pain_signal({ category, duration, prior_attempts[] })`
  - `set_readiness({ desired_outcome, readiness_score, intent })`
  - `set_vision({ transformation_vision })`
  - `save_lead({ name, phone, email?, pattern_diagnosis, ai_analysis })` — `needsApproval: false`; כאן:
    1. valid via zod (שם+phone חובה)
    2. INSERT ל-`leads` עם כל ה-state שנאסף + `conversation` המלאה
    3. קורא ל-Resend gateway → מייל אל `FOUNDER_NOTIFY_EMAIL` עם תקציר
    4. מחזיר `{ ok, lead_id, whatsapp_url: "https://wa.me/${FOUNDER_WHATSAPP_NUMBER}?text=..." }`
- `stopWhen: stepCountIs(50)`
- CORS מלא

## 4. Frontend

### חבילות חדשות
`ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `zod` (אם חסר)

### קבצים חדשים — `src/components/landing/mindhacker/intake/`
- **`IntakeChatModal.tsx`** — מודאל פולסקרין `fixed inset-0 z-[100]` עם רקע `--mh-bg`, חזרה על `AmbientBackdrop` (ערפל+אורב חי) ברקע מטושטש. מציג:
  - Stage A — **Hook screen**: כותרת ("רוב האנשים חיים מתוך דפוסים שהם מעולם לא בחרו") + כפתור "התחל" שמתחיל את ה-chat
  - Stage B — **Chat**: `useChat({ transport: new DefaultChatTransport({ api: edgeFunctionUrl }) })`. רנדור `message.parts`. shimmer "AION סורק..." בעת `status === 'submitted'`. עיצוב: ללא בועות לאסיסטנט, בועות עדינות `--mh-sand/10` למשתמש. ספריית AI Elements מותקנת
  - Stage C — **Reveal screen**: כשהtool `save_lead` החזיר תוצאה, מציג את האבחנה הקבלת + כפתור "המשך לוואטסאפ" → פותח `whatsapp_url` בtab חדש
- **`PromptComposer.tsx`** — `PromptInput` + `PromptInputTextarea` + `PromptInputFooter` (justify-end) + `PromptInputSubmit`
- אייקון/לוגו: אורב AION (לא Sparkles)
- RTL מובנה, focus על textarea אחרי כל הודעה
- ESC + כפתור X לסגירה (עם confirm אם יש שיחה פעילה)

### שינויים בקיים
- `MindHackerLanding.tsx`: state `intakeOpen`, `HeroSection`/`FinalCTA` קוראים `setIntakeOpen(true)` במקום `smartNavigate`. מוצא את `<IntakeChatModal open={intakeOpen} onOpenChange={setIntakeOpen}/>` בסוף ה-shell
- `Index.tsx`: ללא שינוי
- `src/App.tsx`: הסרת `SmartOnboardingProvider`, הסרת import של `OnboardingCeremony`, הסרת `/ceremony` route
- `src/contexts/SmartOnboardingContext.tsx`: נמחק
- `src/hooks/useSmartOnboardingRedirect.ts`: נמחק
- `src/components/modals/MissingQuestModal.tsx`: אם לא בשימוש במקום אחר — נמחק
- `src/routes/redirects.tsx`: ניקוי הפניות onboarding
- `src/pages/OnboardingCeremony.tsx`: ניקוי import (אם נשאר מיותם — מחיקה)

## 5. עיצוב המודאל (mindhacker theme)

- רקע `bg-[hsl(var(--mh-bg))]/95 backdrop-blur-xl`
- AION orb בראש (קטן, חי, מספיק שהמשתמש ירגיש "המערכת בוחנת אותו")
- כותרת serif `mh-serif` עדינה למעלה
- אזור chat גובה מלא, scroll פנימי, composer צף בתחתית
- ללא צבעי wellness — רק `--mh-sand`, `--mh-ink`, `--mh-mute`
- מובייל-first 402px עד דסקטופ

## 6. בדיקות קבלה

- לחיצה על "התחל את השכתוב" / "היכנס פנימה" בלנדינג → מודאל נפתח על המקום, ללא ניווט, ללא login
- ה-AI מתחיל בעצמו ב-Hook (לא טופס, לא רשימת שאלות יבשה)
- שיח