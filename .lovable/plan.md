## What’s broken

The issue is not the phone number itself. The logs show two root causes:

1. The AI still sometimes writes “leave name and WhatsApp” as plain text instead of calling the `request_contact` tool, so the frontend never gets the signal to render the name/phone input boxes.
2. The backend stores collected signals (`pain`, `vision`, `readiness`) only in a temporary per-request object. On the next user message, that object resets, so `save_lead` rejects with `precondition_failed: missing pain or vision signals` even though those signals exist in earlier tool outputs in the conversation history.

## Fix plan

1. **Make backend signal recovery deterministic**
   - Add a helper in `supabase/functions/intake-chat/index.ts` that reconstructs `pain`, `vision`, `readiness`, and `change_depth` from previous tool outputs in `body.messages`.
   - Merge those recovered signals with the current request’s temporary signals before validating and saving.
   - This fixes the exact `precondition_failed` rejection shown in logs.

2. **Make contact extraction prefer real user text**
   - Update `save_lead` so inferred contact values from the latest user message override bad AI tool arguments when needed.
   - Specifically prevent phone-like values from being accepted as the name, so `דין +525612966383` saves as name `דין`, phone `+525612966383`.

3. **Guarantee the UI form appears even if the AI forgets the tool**
   - In `IntakeChatModal.tsx`, add a fallback detector for the latest assistant text asking for “שם” + “וואטסאפ/טלפון”.
   - When detected, render the same structured name + phone input form instead of leaving the user in free-text mode.
   - Keep the existing `request_contact` tool support as the primary path.

4. **Validate after implementation**
   - Deploy the `intake-chat` backend function.
   - Test a representative flow with the edge-function tester: pain → readiness/vision → contact request → `דין +525612966383`.
   - Confirm the response includes `save_lead` with `{ ok: true }` and a new `leads` row is created.