## 1. Auth modal → Google SSO only

Rewrite `src/components/auth/CloudAuthModal.tsx` to drop the email/password form, tabs, signup-enabled logic, and "or" divider. Keep only the "Continue with Google" button (plus title/description and loading state). Remove now-unused imports (`supabase`, `Input`, `Label`, `Tabs*`, `useSignupEnabled`, signup tracking).

No changes to `AuthModalContext` (the `view` arg becomes a no-op, which is fine for existing callers).

## 2. Notifications duplicated

Root cause confirmed in DB: `public.leads` has **two AFTER INSERT triggers** that both call the same `notify_new_lead()` function:
- `on_new_lead`
- `trigger_notify_new_lead`

Every lead → two identical rows in `user_notifications` (verified — same `created_at` to the microsecond).

**Migration**: `DROP TRIGGER IF EXISTS on_new_lead ON public.leads;` (keep `trigger_notify_new_lead`).

Also audit other tables flagged in the trigger list for duplicate fanout — none found besides leads, but the migration will additionally scan and drop any trigger pair on the same table calling the same function (defensive one-liner left out for safety; leads is the only confirmed dup).

The client-side dedupe added previously in `useUserNotifications.ts` stays (defense in depth) but is no longer the fix.

## 3. Rebrand "Mind Hacker" → "Exire Systema" (user-facing only)

Targeted edits to strings users actually see. Code identifiers, file names, CSS class names (`mindhacker-theme`), and folder paths stay — renaming them is out of scope and risky.

Files to edit:
- `supabase/functions/send-test-email/index.ts` — subject line + `from` name.
- `supabase/functions/intake-chat/index.ts` — `from` name on outbound email, `X-Title` header.
- `supabase/functions/aion-landing-chat/index.ts` — `HTTP-Referer` header comment/value left as-is (internal), but the system-prompt mentions "Mind Hacker" → replace with "Exire Systema".
- `supabase/functions/_shared/aiGateway.ts` — `HTTP-Referer` is internal to OpenRouter; leave unchanged (not user-facing). **Skip.**
- `supabase/functions/aurora-chat/orchestrator.ts` — the strings appear inside few-shot examples teaching the model how to handle a user request literally about "Mind Hacker → Mind OS". These are illustrative examples, not brand statements. **Leave unchanged** (changing them would break the prompt's pedagogy).
- Comments-only mentions (`MindHackerLanding.tsx`, `AionLandingChat.tsx` header comments) — leave (not user-visible).

After deploy, both edge functions (`send-test-email`, `intake-chat`, `aion-landing-chat`) will be redeployed automatically.

## Out of scope
- Renaming the `mindhacker/` folder or `MindHackerLanding` component.
- Renaming the `mindhacker-theme` CSS class.
- Docs under `management/`, `docs/`, `README.md`, `PRODUCT_SPEC.md` (internal docs).
- Old migration files (historical record).
