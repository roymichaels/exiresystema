## Why the admin analytics shows 0 visitors

The tracking code is fully built (`src/lib/analytics.ts`, `useAnalytics`, `AnalyticsProvider` mounted in `App.tsx`), but every call is wrapped in:

```ts
const analyticsEnabled = import.meta.env.VITE_ENABLE_APP_ANALYTICS === "true";
if (!analyticsEnabled) return;
```

That env flag is **not set anywhere**, so:
- `visitor_sessions` — 0 rows
- `page_views` — 0 rows
- `conversion_events` — 0 rows
- `content_analytics` — 0 rows

Result: every Admin → Analytics tab (Conversions, Real‑Time, Engagement, User Journey, Video) reads empty tables and reports zero. The traffic happened; nothing recorded it.

A secondary problem: even with the flag on, the homepage CTAs, the intake chat, the landing AION chat, the login modal, and the onboarding flow never call the tracking helpers — so they'd still show up as silent in the funnel.

## About "capture leads from before"

I have to be straight with you: **there is nothing in the database to backfill from.**

- `leads`, `coach_leads`, `exit_intent_leads` → all 0 rows.
- `visitor_sessions`, `page_views`, `conversion_events` → all 0 rows.
- The landing AION chat and IntakeChatModal don't persist messages anywhere — only the final `save_lead` tool call writes a row, and over the last 30 days the intake/landing chat edge functions were invoked 17 times but produced 0 saved leads (visitors started, none reached the qualified hand‑off).

So there is no historical visitor log, no chat transcript, and no abandoned‑lead table to recover. What I *can* do is make sure this never happens again starting now.

## Plan

### 1. Turn tracking on (root fix)
- Remove the `VITE_ENABLE_APP_ANALYTICS` gate in `src/hooks/useAnalytics.ts` so tracking is on by default in production (or default it to `true` when the var is unset, only off when explicitly `"false"`).
- Verify `AnalyticsProvider` wraps the whole app in `App.tsx` (it already does).
- After deploy, confirm rows appear in `visitor_sessions` and `page_views` within a minute of any page load.

### 2. Instrument the homepage and chrome (`MindHackerLanding.tsx`)
- Fire `trackCTAClick("hero_primary" | "hero_secondary" | "topbar_login" | …)` on every CTA button click.
- Fire `trackDialogOpen("auth_modal" | "intake_chat" | "lang_switcher")` when each modal/sheet opens, and `trackDialogClose` when it closes.
- Fire `trackEvent("section_view", "engagement", sectionName)` when each major mh-reveal section enters the viewport (one-shot per session via IntersectionObserver).

### 3. Instrument the intake & landing chats
- `IntakeChatModal`: fire `trackFormView("intake_chat")` on open, `trackFormStart` on first user message, `trackFormSubmit("intake_chat", success)` when `save_lead` returns, and `trackEvent("chat_message", "intake", role)` per message.
- `AionLandingChat`: same pattern with `source = "aion_landing"`.
- Add a thin `landing_chat_messages` table (session_id, role, content, source, created_at, RLS: insert-anon, select-admin) and append every user + assistant message from both chats. This is what lets you recover near-misses in the future — even when the AI never reaches `save_lead`, you'll still see the conversation in admin and can follow up manually.
- Surface those transcripts under **Admin → Leads → Chat Transcripts** (new tab in `src/pages/admin/Leads.tsx`).

### 4. Instrument onboarding & auth
- In the auth modal flows: `trackSignupStart` on submit, `trackSignupComplete` after success, `trackEvent("login_success" | "login_failed", "auth")`.
- In the onboarding flow (`SmartOnboardingContext` + steps): `trackEvent("onboarding_step", "onboarding", stepId)` on each step entry, `trackEvent("onboarding_complete", "onboarding")` at the end.

### 5. Coach panel analytics
- Audit `src/pages/admin/Coaches.tsx` and the coach-facing pages to fire the same `trackEvent` helpers on coach signups, profile views, plan-purchase clicks, and booking submissions — they're currently invisible to admin Analytics.

### 6. Verify
- Trigger one full path: load `/`, open intake chat, send a message, open login modal, sign in, complete onboarding.
- Query `visitor_sessions`, `page_views`, `conversion_events`, `landing_chat_messages` and confirm rows appear with the right `event_type` / `source`.
- Reload Admin → Analytics and confirm the Real‑Time, Conversions, User Journey, and Engagement tabs now display the new activity.

### Technical notes
- The gate change is one line in `src/hooks/useAnalytics.ts` — flipping the default to `true` unless `VITE_ENABLE_APP_ANALYTICS === "false"` is the safest way to keep an emergency off‑switch.
- New `landing_chat_messages` table needs a migration with RLS: `insert` allowed to anon (so unauthenticated landing visitors can be logged), `select` restricted to `has_role(auth.uid(),'admin')`.
- All new tracking calls are fire‑and‑forget (`void trackEvent(...)`) so they never block UX even if the network is slow.
- No business‑logic changes — purely instrumentation + one new log table.
