## מטרה

להחליף את ה-floating button שפותח את ה-Intake Onboarding בצ׳אט בוט אמיתי, סשני, שיודע לענות על שאלות לגבי דף הבית — תוכן, מתודולוגיית Exire Systema, ושדות החקירה — ובמקומות הנכונים דוחף ל-CTA של ה-intake הקיים.

הצ׳אט ייראה ויישמע כמו חלק מהדף (theme: `mh-bg`, `mh-sand`, `mh-serif`), לא כמו widget זר.

---

## 1. UX

**Trigger** — אותו כפתור צף שכבר קיים (`AionFloatingWidget`), אבל onClick פותח את ה-`AionLandingChat` במקום את `IntakeChatModal`.

**Surface** — Drawer מימין (RTL) ברוחב `max-w-md` במובייל מסך מלא, ב-desktop `~420px`. רקע `hsl(var(--mh-bg))` עם `border-inline-start` ב-`mh-line`. ללא צל/glow — נאמן ל-design memory (NO gradients/shadows).

**Header** —
- כותרת: `AION` (LTR, serif)
- Subtitle זעיר: "שואל על הדף הזה" (eyebrow)
- כפתור סגירה (X)

**Empty state** — הודעה פתיחה מאת AION + 3 quick-suggestions:
- "מה זה Exire Systema?"
- "מה ההבדל בין היפנוזה רגילה לעבודה שלך?"
- "איך מתחילים?"

**Messages**
- Assistant: ללא רקע. טקסט `mh-ink` עם `mh-serif` לפסקאות קצרות, body בעברית בגופן הרגיל.
- User: bubble דק (`bg-[hsl(var(--mh-bg-2))]`, `text-[hsl(var(--mh-ink))]`), פינות `rounded-2xl`, צמוד ל-inline-end.
- תמיכה ב-markdown ל-assistant.
- Streaming text — תווים מופיעים בזרימה.

**Composer** — textarea (rows=1, auto-grow), placeholder "שאל את AION על המסע…", כפתור שליחה בצד עם אייקון, Enter שולח, Shift+Enter שורה חדשה. Focus אוטומטי בפתיחה / אחרי שליחה / אחרי סיום stream.

**CTA דחיפה** — כאשר המודל מזהה כוונה ("איך מתחילים", "אני רוצה להתחיל", "כמה זה עולה", "תיאום שיחה") הוא יחזיר Markdown link שמובנה במערכת ההודעות. הלינק הזה במקום לפתוח URL — מפעיל `onOpenIntake()` שסוגר את הצ׳אט ופותח את `IntakeChatModal`. הזיהוי בצד הקליינט: נחפש token מיוחד שהמודל יודע להחזיר (`[[OPEN_INTAKE]]`) ונרנדר אותו ככפתור `mh-cta-primary` קטן בתוך הבועה.

---

## 2. ארכיטקטורה

### Frontend

קובץ חדש: `src/components/landing/mindhacker/AionLandingChat.tsx`
- מצב מקומי בלבד (`useState<UIMessage[]>`). אין persistence.
- שימוש ב-AI SDK `useChat` + `DefaultChatTransport` עם endpoint של edge function.
- רינדור דרך `message.parts` (text parts).
- Loading state: "AION חושב…" עם נקודה פועמת ב-`mh-sand`.

עדכון `MindHackerLanding.tsx`:
- state חדש `chatOpen` (נפרד מ-`intakeOpen`).
- `AionFloatingWidget.onOpen` → `setChatOpen(true)`.
- הוספת `<AionLandingChat open={chatOpen} onOpenChange={setChatOpen} onOpenIntake={() => { setChatOpen(false); setIntakeOpen(true); }} />`.

ה-Intake הקיים לא נוגעים בו. ה-CTAs של ה-Hero/Final נשארים פותחים את ה-intake ישירות.

### Backend — Edge Function חדש

`supabase/functions/aion-landing-chat/index.ts`

- `verify_jwt = false` (אנונימי, דף נחיתה).
- CORS מלא.
- משתמש ב-`_shared/aiGateway.ts` הקיים בפרויקט (כבר תומך ב-OpenRouter / Lovable AI Gateway fallback). מודל ברירת מחדל: `google/gemini-3-flash-preview`.
- מקבל `{ messages: UIMessage[] }` ומחזיר `streamText().toUIMessageStreamResponse()`.
- System prompt קומפקטי (נטמע inline) שמכיל:
  - מי זה מיינד האקר ("אדריכל תודעה ואסטרטג זהות תת־מודעת", solo founder, "אני").
  - תקציר הסקשנים: Hero ("התודעה שלך לא נבנתה על ידך"), The System, What I Do, Method (5 שלבי Exire Systema המלאים מ-`STEPS`), Content (6 שדות חקירה).
  - **חוקי תגובה**:
    - תמיד עברית, ניסוח קצר וצלול בטון של הדף (קולנועי, רך, ישיר).
    - אסור להמציא מחירים, תאריכים, או הבטחות תוצאה.
    - ענה רק על הדף — אם נשאל על משהו אחר, החזר את השיחה לעמוד.
    - לזיהוי כוונת התחלה → להחזיר בסוף ההודעה את ה-token `[[OPEN_INTAKE]]` בשורה משלו (הקליינט מסתיר אותו וממיר לכפתור).
    - ללא emojis, ללא markdown כבד — רק פסקאות קצרות.
- אין tools. אין persistence.

### חבילות

- `ai` ו-`@ai-sdk/react` ו-`@ai-sdk/openai-compatible` — נבדוק אם כבר מותקנים; אם לא, `bun add`.

---

## 3. מפרט טכני

```text
src/components/landing/mindhacker/
├── MindHackerLanding.tsx        ← עדכון: state chatOpen, רינדור AionLandingChat
└── AionLandingChat.tsx          ← חדש: Drawer + useChat + composer

supabase/functions/
└── aion-landing-chat/index.ts   ← חדש: streamText, system prompt מהדף, [[OPEN_INTAKE]]
```

**CTA token flow**
1. המודל מסיים תשובה ב-`\n[[OPEN_INTAKE]]`.
2. קליינט מפצל: לפני ה-token = טקסט רגיל, ה-token עצמו → רנדור כפתור "התחל את השכתוב" שמפעיל `onOpenIntake`.

**Auto-scroll** — `useEffect` עם `messages.length` שגולל ל-bottom של אזור ההודעות.

**Focus management** — `ref.current?.focus()` ב-mount, אחרי `status === 'ready'`, ואחרי שליחה.

**אין שינויי DB**, אין secrets חדשים (משתמש ב-`LOVABLE_API_KEY` / `OPENROUTER_API_KEY` הקיימים).
