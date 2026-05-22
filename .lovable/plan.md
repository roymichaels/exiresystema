## Problem

Your screenshot shows the model jumped straight to the closing line ("זיהיתי. השלב הבא כבר ממתין.") after only two user turns, without ever asking for name + phone and without calling `save_lead`. Because `save_lead` never ran, no lead was inserted, no founder email was sent, and the success UI in the modal never appeared — so the conversation just dead-ended on a fake "I identified you" line.

Root cause is in `supabase/functions/intake-chat/index.ts`:

1. The system prompt literally tells the model what to say *after* `save_lead` returns ("זיהיתי. השלב הבא כבר ממתין."). Models love to parrot that line — and they do it without bothering to call the tool first.
2. There is no hard gate forcing the model through the Contact step. Steps 1–6 are described, but nothing prevents the model from skipping to step 6's wording while skipping the actual contact ask.
3. The Hook starter message ("בוא נתחיל") is sometimes interpreted by the model as "user is already qualified" and it tries to wrap up early.

## Fix

Edit only `supabase/functions/intake-chat/index.ts` (prompt + tool wiring). No client changes needed — `IntakeChatModal` already renders the success state correctly the moment `save_lead` returns `ok: true`, and it already renders typing/error states fine.

### 1. Remove the parrot line from the prompt

Delete the block that tells the model to write "זיהיתי. השלב הבא כבר ממתין." after `save_lead`. Replace with an explicit prohibition:

- "אסור לכתוב 'זיהיתי', 'השלב הבא', 'סיימנו', או כל ניסוח של סיום, לפני ש-save_lead החזיר {ok:true}. ה-UI מציג את הסיום — אתה לא."
- "אחרי save_lead מוצלח — תשתוק. אל תכתוב טקסט נוסף."

### 2. Make the Contact step mandatory and explicit

Rewrite step 6 in the prompt:

- "לפני save_lead חובה לבקש *במפורש* שם וטלפון בהודעה נפרדת. אסור לאסוף אותם דרך offer_choices."
- "אסור לקרוא save_lead לפני שהמשתמש שלח גם שם וגם טלפון בטקסט חופשי."
- Add a precondition list inside `save_lead`'s description: "Do NOT call unless: (a) set_pain_signal already ran, (b) set_readiness or set_vision already ran, (c) the latest user message contains a name AND a phone number (digits)."

### 3. Server-side guard inside `save_lead.execute`

Defense in depth — even if the model misbehaves, refuse to save without real signals:

```ts
if (!signals.pain_category && !signals.transformation_vision) {
  return { ok: false, error: 'precondition_failed: missing pain/vision signals' };
}
if (!/\d{6,}/.test(args.phone)) {
  return { ok: false, error: 'invalid_phone' };
}
```

When this returns `ok: false`, the modal's `saveResult` memo (which already checks `payload.ok`) will not trigger the success screen, and the model will be forced to continue the conversation.

### 4. Strengthen the Hook trigger

The starter message currently is just `t('startMessage')`. Change the prompt so the model treats the first user message as "begin scan" not as content — i.e., always open with Echo regardless of what the first message says.

## Out of scope

- `IntakeChatModal.tsx` (already correct — success UI + close button work the moment a valid `save_lead` returns).
- DB schema, analytics, notifications bell — all working from yesterday's fix.
- Translations.

## Verification

1. Open intake on `/`, click hook CTA, answer 2 vague turns → confirm the model now keeps asking instead of closing.
2. Walk through to the Contact prompt → enter "דוד 0521234567" → confirm `save_lead` is called, success screen renders with `pattern_diagnosis`, close button works.
3. Check `leads` table for a new row + admin notification bell increments.
4. Try replying with a name only (no phone) → confirm save is rejected and chat continues.
