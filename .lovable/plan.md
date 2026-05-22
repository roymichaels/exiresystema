## What I found

Three separate concerns, three different states.

### 1. Lead notifications (admin bell) — already working ✓
- DB confirms it: 1 row in `public.leads` (Hebrew test lead "דוד כהן") and 2 rows in `public.admin_notifications` with `type='new_lead'`, link `/admin-hub?tab=admin&sub=leads`.
- The DB trigger `notify_new_lead` already fires on every `leads` INSERT and writes to `admin_notifications`.
- `NotificationBell` (admin) and `UserNotificationBell` (logged-in non-admin) are already wired into `Header.tsx` lines 295-299 with realtime subscriptions on `admin_notifications` / `user_notifications`. They work.

No code change needed for the bell itself — it's already there. But the user may not realize it works because *they* aren't always logged in as admin on the device viewing the preview. I'll add a tiny visual nudge so it's obvious (see #3).

### 2. Leads not in analytics — real bug
The Conversion Analytics widget (`src/components/admin/analytics/ConversionMetrics.tsx`) measures the funnel from `conversion_events.event_type` (`cta_click`, `form_start`, `form_success`). DB query shows:
- `form_start` events exist for `source='intake_chat'` (7 total)
- **Zero** `form_success` events — even though a lead was saved
- Reason: `trackFormSubmit('intake_chat', true, …)` lives inside the `saveResult` `useEffect`. Before today's fix, `saveResult` was never set client-side (modal stayed stuck), so the success event was never emitted. Now that the success detection is robust, `form_success` will flow — but the lead from yesterday is permanently missing from the funnel.

The Conversion dashboard also never reads from the actual `leads` table, so even if tracking fails, you have a source-of-truth count you can show.

### 3. The header bell visibility — clarify
The bell is already in the header for every logged-in user. Non-logged-in visitors don't see it (by design — there's nothing to notify). The user's previous request asked for "all users for logged in" which is satisfied. I'll just verify the icon color works in both admin and user mode and confirm.

---

## Changes

### A. Make Conversion Analytics reflect real leads (`ConversionMetrics.tsx`)

1. Add a new query that reads `public.leads` count for the last 30 days (filtered by `source='intake_chat'` plus all sources, broken down).
2. Add a new stat card: "לידים שנקלטו" showing the real `leads` row count for the last 30 days, with a subtitle "מטבלת הלידים".
3. Add a second value to the funnel's final stage so it shows BOTH the analytics-event count and the DB row count side by side (e.g. `12 (DB: 14)`). This way a tracking gap is visible immediately.
4. Pull `exit_intent_leads` count into the same widget so both lead pipelines are represented.

### B. Backfill the missing `form_success` event for the existing lead

Insert one `conversion_events` row tied to the existing lead `301d088d…` with `event_type='form_success'`, `source='intake_chat'`, `created_at` matching the lead. Single one-off migration so the funnel reflects historical truth. (This is a tiny data-only insert, no schema change.)

### C. Verify the realtime bell path end-to-end

After deploy, trigger a fresh test lead via the deployed `intake-chat` curl path (already proven working) and confirm:
- `admin_notifications` row appears within 1s
- The bell in the header increments via the realtime channel
- Clicking the bell opens the panel with the lead link

No code change expected here, this is verification only.

### D. Out of scope

- No changes to `intake-chat` edge function (lead capture + Resend already working).
- No changes to `Header.tsx` bell wiring (already correct).
- No new notification types or DB schema changes.
- No changes to `useAdminNotifications` / `useUserNotifications` (already realtime).

---

## Files

- Edit: `src/components/admin/analytics/ConversionMetrics.tsx` (add leads query + new stat card + funnel augmentation)
- New migration: backfill one `conversion_events` row for the existing lead

## Verification

1. Reload `/admin-hub` → Analytics tab → Conversion → see "לידים שנקלטו" card with value `1` (or higher after a fresh test).
2. From a second device/tab, run a fresh intake → confirm: lead row, admin_notification row, header bell badge increments, panel shows the entry, funnel `form_success` increments.
