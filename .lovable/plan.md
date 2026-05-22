# Fix Lead Email Notifications + Verify Intake Onboarding

## Problem

The test email succeeded earlier because `send-test-email` calls Resend directly at `api.resend.com`. But the real lead-capture notification in `supabase/functions/intake-chat/index.ts` (`notifyFounder`) sends through `connector-gateway.lovable.dev/resend/emails` — a different path that requires the Lovable Resend connector to be wired. That mismatch is the most likely reason founder notifications aren't arriving even though the test email did.

There are also zero rows in the `leads` table, so we have no historical evidence that `notifyFounder` was ever invoked successfully — meaning the onboarding intake conversation may never have reached `save_lead` either.

## Changes

### 1. Align lead notification with the working test pipeline
File: `supabase/functions/intake-chat/index.ts` — `notifyFounder()`

- Replace the `connector-gateway.lovable.dev/resend/emails` POST with a direct `https://api.resend.com/emails` POST using `Authorization: Bearer ${RESEND_API_KEY}` (identical headers/body shape to `send-test-email`).
- Keep the same subject/HTML body (Hebrew RTL summary of the lead).
- Add a `console.log` of `{ status, id }` from Resend so future founder-notify failures show up in edge-function logs.
- Guard: if `RESEND_API_KEY` or `FOUNDER_NOTIFY_EMAIL` is missing, log a warning instead of silently returning.

### 2. Redeploy `intake-chat`
Deploy after the edit so the new sender path goes live (edge functions serve the last deployed code, not file edits).

### 3. Verify the full intake → notification path
- Tail `intake-chat` logs and trigger a minimal scripted `save_lead` via `supabase--curl_edge_functions` with a fabricated conversation that already contains name+phone, so the model calls `save_lead` immediately.
- Confirm:
  - A row appears in `public.leads`.
  - `notifyFounder` logs a 200 response from Resend.
  - The admin (`FOUNDER_NOTIFY_EMAIL`) inbox receives the lead summary.
- If the model refuses to call `save_lead`, fall back to invoking `notifyFounder` indirectly by inserting a synthetic lead row + calling the function — but only as a backup.

### 4. Verify onboarding (AION intake chat) is healthy
- Hit `/` and `/intake` (or whichever route mounts `IntakeChatModal`) in the browser preview, confirm the chat streams, `offer_choices` chips render, and reaching name+phone triggers the success state (`__save_lead_success__`).
- Check console + network for streaming errors against `aion-landing-chat` and `intake-chat`.

## Out of scope

- No DB schema changes. No UI changes to the intake modal. No admin-settings UI for the recipient email — the recipient stays `FOUNDER_NOTIFY_EMAIL` (the secret already used by the working test email). If you want a settings-table-driven recipient later, that's a separate task.
