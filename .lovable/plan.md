## אבחנה — למה זה לא עובד

**1. "Load failed" (השגיאה האדומה במסך)**
ה־edge function `intake-chat` **לא פרוס**. בדקתי ישירות מול הגייטוויי:
```
POST /functions/v1/intake-chat → 404 NOT_FOUND
"Requested function was not found"
```
הקוד קיים ב־`supabase/functions/intake-chat/index.ts`, אבל הוא מעולם לא דופלוי. בנוסף, אין לו ערך ב־`supabase/config.toml` — לכן כש־`useChat` עושה POST, הוא חוזר עם 404 לפני שמתחילה שום בקשת AI. לכן גם אין שום לוג.

**2. למה יש צ׳אט/קומפוזר חדשים במקום AION**
זה היה שיקול דעת שגוי שלי. בנינו פה stack מקביל:
- `IntakeChatModal` במקום ה־shell של AION
- AI Elements (`PromptInput`, `PromptInputTextarea`, `PromptInputSubmit`, `Shimmer`) במקום `AuroraChatInput` / `AuroraChatMessage` / `AuroraTypingIndicator` / `AuroraHoloOrb`
- `useChat` ישיר מ־`@ai-sdk/react` במקום הצינור של AION

הסיבה הטכנית: `AuroraChatArea` קשור ל־`useAuroraChat(conversationId)` שדורש משתמש מחובר ומסנכרן ל־`messages` בדאטה־בייס. הסריקה היא **אנונימית** (לפני login) ועם transport אחר (`intake-chat`), אז לא יכולתי לחבר אותה 1:1 ל־AuroraChatArea. אבל זו לא סיבה לבנות UI חדש — היה צריך לעטוף את אותם רכיבי המסך של AION סביב transport אחר. זה מה שאתקן.

---

## תכנית

### שלב 1 — להפעיל את הצ׳אט (סוגר את "Load failed")
1. להוסיף ל־`supabase/config.toml`:
   ```
   [functions.intake-chat]
   verify_jwt = false
   ```
   (כדי לאפשר גישה אנונימית מנחיתה).
2. לעשות deploy של `intake-chat` ולוודא עם curl ש־POST מחזיר stream תקין.
3. לבדוק שה־ENV הקיים מספיק: `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `FOUNDER_NOTIFY_EMAIL`, `FOUNDER_WHATSAPP_NUMBER`. אם חסר משהו → לבקש secret לפני הפריסה.

### שלב 2 — להשתמש ב־UI של AION (בלי קומפוזר חדש)
לשכתב את `IntakeChatModal` כך שיהיה רק **shell קולנועי** + transport אנונימי, אבל **כל הרכיבים הויזואליים יהיו של AION**:

- בועות הודעות → `AuroraChatMessage`
- אינדיקטור הקלדה → `AuroraTypingIndicator`
- קומפוזר → `AuroraChatInput` (אותו טקסט־אריאה, אותם כפתורים — מיק, גלגול, slash, שליחה — שראית בצילום)
- האורב המרכזי → `AuroraHoloOrb` (במקום הספירה החומה הנוכחית)

מה כן נשאר ייחודי ל־intake:
- ה־transport: `DefaultChatTransport({ api: '…/intake-chat' })`
- Stage A (ה־Hook עם "התחל את הסריקה")
- Stage C (ה־reveal עם CTA לוואטסאפ אחרי `save_lead`)
- הכותרת "AION · Consciousness Scan" + כפתור X

תוצאה: זהה חזותית ל־AION, אבל ללא login וללא כתיבה ל־`messages`.

### שלב 3 — להסיר תלות מיותרת
- להוריד את השימוש ב־AI Elements מהמסך הזה (`PromptInput*`, `Shimmer`). הקבצים יישארו לעת עתה (כדי לא לשבור משהו אחר), אבל לא בשימוש בנתיב ה־intake.
- לוודא שאין import שבור אחרי השינוי.

### שלב 4 — אימות
1. `curl` ל־`/intake-chat` עם payload של הודעה ראשונה → לקבל stream.
2. לפתוח את המודאל מהלנדינג, ללחוץ "התחל" → לוודא שמופיעה הודעת AION עם בועה בסגנון AION ולא Load failed.
3. לעבור את 5 השלבים עד `save_lead` → לבדוק ב־DB שנוצר רשומה ב־`leads` ושה־reveal עם CTA לוואטסאפ נפתח.

---

## פרטים טכניים

**קבצים שיתעדכנו:**
- `supabase/config.toml` — בלוק function עבור `intake-chat`.
- `src/components/landing/mindhacker/intake/IntakeChatModal.tsx` — החלפת ה־composer והבועות ברכיבי Aurora; הסרת import ל־AI Elements; הוספת `AuroraHoloOrb` כרקע מרכזי.

**מה לא משתנה:**
- `supabase/functions/intake-chat/index.ts` — הקוד עצמו תקין; רק פריסה + config.
- טבלת `leads` והעמודות שנוספו.
- חיווט ה־CTA ב־`MindHackerLanding.tsx`.

**הנחה:** אתה רוצה שה־intake **לא** ידרוש login (CTA אנונימי מהלנדינג). אם אתה רוצה דווקא login לפני intake — תגיד ואשנה.