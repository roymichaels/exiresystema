## Status of email infrastructure

- `RESEND_API_KEY` is **already configured** in the project.
- `intake-chat` already calls Resend to notify the founder, but the recipient address, sender, and template are hardcoded — none of it is editable from admin.
- There is no auto-reply to the lead, no per-lead manual send, no broadcast.

## What I'll build

### 1. New `email_settings` table (single-row config, admin-only)
Stored in DB so it can be edited live from the admin panel. Fields:
- `from_name`, `from_email` (default: `Exire Systema <noreply@exiresystema.com>`)
- `reply_to_email`
- `admin_notify_email` (default: current `FOUNDER_NOTIFY_EMAIL`)
- `admin_notify_enabled` (bool)
- `auto_reply_enabled` (bool)
- `admin_notify_subject`, `admin_notify_html` (template with `{{name}} {{phone}} {{email}} {{intent}} {{pattern_diagnosis}}` variables)
- `auto_reply_subject`, `auto_reply_html` (template with `{{name}}`)
- `broadcast_default_subject`, `broadcast_default_html`

RLS: select/update restricted to admins via `has_role(auth.uid(), 'admin')`.

### 2. One unified edge function: `send-lead-email`
Single entry point used by everything:
- `mode: "admin_notify"` — fired by `intake-chat` after a lead is saved
- `mode: "auto_reply"` — fired by `intake-chat` when lead provided email
- `mode: "manual"` — admin sends a custom email to one lead from the Leads page
- `mode: "broadcast"` — admin sends to all leads matching filters (status, source)

Function loads `email_settings` from DB, renders the template (simple `{{var}}` interpolation, all values escaped), sends via Resend through the connector gateway, and logs every send into a new `email_send_log` table (recipient, mode, subject, status, error, lead_id, sent_at) — visible in the admin panel.

JWT verification on for manual/broadcast (admin only); off for the intake-chat-triggered modes (called server-side).

### 3. Update `intake-chat`
Replace the inline `notifyFounder` with two calls to `send-lead-email` (`admin_notify` + `auto_reply` when an email exists), so all email behavior is driven by `email_settings`.

### 4. New admin tab: **Settings → Emails**
Added to `ADMIN_TABS` (sub-tab of Settings, or a new tab depending on the existing structure). Three sections:

1. **Sender & recipients** — From name, From email, Reply-to, Admin notify recipient.
2. **Toggles** — Enable/disable admin notify, auto-reply.
3. **Templates** — Subject + HTML body editors for each of: admin notify, auto-reply, broadcast default. Live "Available variables" hint and a **Send test** button (sends the rendered template to the admin's email).

All fields save back to `email_settings` (no redeploy needed).

### 5. Enhance the admin **Leads** page
- New **"Send email"** button per lead → opens a dialog (recipient prefilled, subject + body editable, starts from auto-reply template), POSTs to `send-lead-email` with `mode: "manual"`.
- New **"Broadcast"** button at the top → dialog with status/source filters, subject + body editors prefilled from broadcast template, confirm count, POSTs with `mode: "broadcast"`.
- New **Email log** sub-tab showing recent sends from `email_send_log` with status badges.

### 6. From-address note
You picked `noreply@exiresystema.com`. For Resend to actually deliver from that address you need to verify `exiresystema.com` in your Resend dashboard (SPF/DKIM records). I'll make the field editable so:
- Until verification is complete, you can temporarily set it to `onboarding@resend.dev` from the admin panel and emails will still flow.
- Once verified, change the From field in Settings → Emails — no redeploy needed.

I'll surface a small warning banner in the admin Emails tab if the From domain isn't `resend.dev` and a test send fails with a domain-verification error.

## Files touched

- Migration: create `email_settings` (with sane defaults), `email_send_log`, RLS policies.
- New: `supabase/functions/send-lead-email/index.ts`
- Edited: `supabase/functions/intake-chat/index.ts` (replace notifyFounder)
- New: `src/pages/admin/EmailSettings.tsx` + register in `src/domain/admin/tabConfig.ts`
- Edited: `src/pages/admin/Leads.tsx` (per-lead Send + Broadcast dialogs, email log view)
- New hook: `src/hooks/admin/useEmailSettings.ts`

## Out of scope (ask before adding)

- Scheduled/drip campaigns
- Visual template builder (we ship HTML + variable hints)
- Switching to Lovable's managed email system (you already use Resend directly — keeping it)
