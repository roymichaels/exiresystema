
## Goal

Treat the admin panel as a single-coach console (admin = the only coach). Collapse the 7 overlapping tabs into **4**, merge duplicates, and add a single **Integrations** hub that wires real third-party services (WhatsApp, Email, Google Calendar, Stripe, Google Meet) into the existing CRM, Plans, and Marketing flows.

## 1. Tab structure (7 → 4)

```text
Coach      Marketing            Content            System
─────      ─────────            ───────            ──────
Overview   Affiliates           Products           Users
Clients    Newsletter           Blog               Analytics
Leads      Offers               Videos             Notifications
Plans      Landing Pages        Recordings         Bug Reports
Calendar   Homepage             Forms              Integrations  ← new
           Theme / FAQs                            Settings
           Testimonials
```

Merges (old → new home):
- Coach > Overview ← merges Admin > Analytics dashboard widgets
- Coach > Clients ← absorbs Admin > Users (keep role-management as a sub-view)
- Coach > Plans ← absorbs Content > Products pricing (plans are sellable products)
- Marketing ← Campaigns + Site collapsed into one tab
- System > Settings ← absorbs Coach > Profile, Template Coverage, Chat Assistant, Work Monitor, FM Bounties, Career Apps, Businesses, Aurora Insights (moved into Settings sub-sections, since these are rarely used)

Files touched: `src/domain/admin/tabConfig.ts` (single source of truth), `src/components/admin/AdminInlineNav.tsx`, `src/components/admin/AdminStatsBar.tsx`. Delete `CoachSettingsTab` redirect; route `/admin?tab=coach&sub=profile` → `system/settings`.

## 2. Integrations hub (new)

New page `src/pages/admin/Integrations.tsx` + `src/components/admin/integrations/` containing one `IntegrationCard` per provider with: status badge (connected / not connected / error), Connect button, Test button, last-used timestamp, and a settings drawer.

Providers to wire:

| Provider | Used for | Connection method |
|---|---|---|
| **Twilio (WhatsApp + SMS)** | Send messages to leads/clients from CRM | Lovable connector |
| **Resend (Email)** | Reuse existing connection; expose status + test send | Lovable connector (already in code) |
| **Google Calendar** | Sync sessions/bookings | Lovable connector |
| **Google Meet** | Auto-attach meet link when creating a Calendar event | Same Google Calendar connection (conferenceData API) |
| **Stripe Payments** | Sell 1:1 sessions ($150), packages, plans | `payments--enable_stripe_payments` (built-in) |

## 3. Feature wiring

**CRM (Leads + Clients)** — `src/components/crm/LeadsCRM.tsx`:
- Replace the bare WhatsApp/Phone/Email `<a>` buttons with real actions:
  - WhatsApp → calls new edge function `send-whatsapp` (Twilio) with templated message; falls back to `wa.me` deep link if Twilio not connected.
  - Email → opens a compose drawer that posts to `send-coach-email` edge function (Resend).
  - "Schedule" → opens booking drawer that creates a Google Calendar event w/ Meet link via `create-booking` edge function and writes the booking back to the lead (status → `scheduled`, `metadata.calendar_event_id`).
- Auto-log every outbound message into `lead_activity` (new table).

**Plans tab** — `src/components/careers/coach/CoachPlansTab.tsx`:
- Each plan gets "Sell with Stripe" toggle → creates Stripe product + price via `create-checkout-session` edge function (default $150 one-off session preconfigured).
- New "Checkout link" button copies a shareable Stripe checkout URL.

**Coach Overview** — show 4 KPI tiles tied to integrations: messages sent (Twilio), emails sent (Resend), upcoming sessions (Calendar), revenue (Stripe).

## 4. Database

One migration:
- `coach_integrations` (singleton row keyed by coach user_id): `{ twilio_from, default_calendar_id, stripe_price_id_session, signature, brand_color }`.
- `lead_activity` (id, lead_id, kind: `whatsapp|email|call|note|booking`, payload jsonb, created_at, created_by). RLS: admin/practitioner only.
- Index on `lead_activity(lead_id, created_at desc)`.

## 5. Edge functions (new)

- `send-whatsapp` — Twilio gateway, validates body with Zod, writes `lead_activity`.
- `send-coach-email` — Resend gateway, supports html/text/templates.
- `create-booking` — Google Calendar gateway, creates event + Meet link, updates lead status.
- `list-upcoming-sessions` — read-only, for Overview KPI.
- `stripe-create-session-product` — creates Stripe product+price for a coach plan.

All use `verify_jwt = true` + `has_role('admin' OR 'practitioner')` check.

## 6. Connector setup order

1. Run `standard_connectors--connect` for `twilio`, `google_calendar`, and verify existing `resend`.
2. `payments--recommend_payment_provider` → `payments--enable_stripe_payments`.
3. Write migration → write edge functions → deploy → wire UI cards + CRM/Plans actions.

## Out of scope

- Migrating historical data into `lead_activity` (starts fresh).
- Per-user (client-facing) OAuth — connectors authenticate the coach only.
- SMS pumping protection config (will surface a warning in the Twilio card linking to Twilio console).
- Renaming files/folders (`careers/coach/*` stays where it is; only nav + imports change).
