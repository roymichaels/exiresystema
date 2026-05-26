# Restore access to uploads, media, and other admin tools

The features (audio/video upload, products, assignments, media player) still exist — they're just buried under `/admin-hub` with no deep links and no shortcut from the new client home. Plan: keep all existing code, add discoverability.

## 1. Make `/admin-hub` honor `?tab=&sub=` (and `?action=`)
- `src/pages/AdminHub.tsx` already accepts `activeTab`/`activeSubTab` props from `AdminLayoutWrapper.tsx`, which already reads `tab` and `sub` from `useSearchParams`. Verify deep links survive reload (they should — confirm and fix if not).
- Pass `action` query param through to the active sub-page so `Recordings.tsx` can auto-open `AudioUploadDialog` when `?action=upload-audio` (or `upload-video`).

## 2. Auto-open upload dialogs on `Recordings.tsx`
- Read `?action=` via `useSearchParams`.
- If `action=upload-audio` → open `AudioUploadDialog`, switch tab to `library`.
- If `action=upload-video` → open `VideoUploadDialog`, switch tab to `videos`.
- Clear the param after opening so reloads don't keep re-triggering.

## 3. Replace single "Admin" tile on `ClientHome.tsx` with a Coach Tools section
For admin/practitioner users, render a small grid of deep links instead of the one generic Admin card:
- Upload hypnosis recording → `/admin-hub?tab=content&sub=recordings&action=upload-audio`
- Upload video → `/admin-hub?tab=content&sub=recordings&action=upload-video`
- Recordings library → `/admin-hub?tab=content&sub=recordings`
- Products & offers → `/admin-hub?tab=content&sub=products`
- Series & episodes → `/admin-hub?tab=content&sub=series`
- Clients → `/admin-hub?tab=coach&sub=clients`
- Assignments (send audio to client) → `/admin-hub?tab=content&sub=recordings` (assignments tab)
- Admin home → `/admin-hub`

Tile style matches the existing shortcut grid (rounded-2xl, border, backdrop-blur).

## 4. Sweep for anything else that disappeared
Quick audit of routes that existed before the home rewrite to make sure they're still reachable from somewhere in the UI:
- `/audio/:token` (AudioPlayer) — link-based, no nav needed ✓
- `/courses`, `/community`, `/me` — already linked from home ✓
- Any other top-level pages mounted in `App.tsx` that lost their entry point: add to a secondary "More" row on `ClientHome.tsx` (only the ones a logged-in client/coach actually needs day-to-day).

## 5. Confirm `tabConfig.ts` ids match the query strings
Read `src/domain/admin/tabConfig.ts` to confirm tab id `content` has sub-ids `recordings`, `products`, `series`, and tab `coach` has sub-id `clients`. Adjust the links in step 3 to whatever the real ids are — no renaming of existing ids.

## Files touched
- `src/pages/ClientHome.tsx` — new coach tools section
- `src/pages/admin/Recordings.tsx` — read `?action=`, open upload dialog
- `src/components/admin/AdminLayoutWrapper.tsx` — pass `action` through (or `Recordings` reads it directly via `useSearchParams`, no wrapper change needed)
- Maybe `src/pages/AdminHub.tsx` if needed to forward extra query params

## Out of scope
- No new tables, edge functions, or backend changes.
- No changes to upload/player components themselves — they already work.
- No reintroduction of the AION chat shell on `/home`.

## Open question
Should the upload shortcuts appear only for `admin`, or also for `practitioner`? Default: both, since both roles upload content for their clients.
