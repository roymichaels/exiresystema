## Problem

When a logged-in user visits `/` or `/home`, they still see the full-screen AION chat surface with an "AION" header and "Message AION…" composer, instead of the client-facing coach app home.

Root cause:
- `src/routes/redirects.tsx` declares `['/home', '/']` and `['/index', '/']` in `PUBLIC_REDIRECTS`. Every navigation to `/home` (including `Index.tsx`'s `<Navigate to="/home" />`) short-circuits back to `/`.
- `/` renders `SmartRoot`, which for authenticated users renders `ShellV2` — the AION chat-first surface (header "AION", composer "Message AION…", floating orb fills the screen).

So even though previous edits pointed everything to `/home`, the redirect map sends users back to the AION chat.

## Plan

### 1. Stop redirecting `/home` to `/`
- `src/routes/redirects.tsx`:
  - Remove `['/home', '/']` from `PUBLIC_REDIRECTS`.
  - Keep `['/index', '/home']` (rewrite, not back to `/`) so deep links land on the client home.
  - Keep `/messages/ai → /home`, `/now → /home`, etc.

### 2. Make `/` the client home for logged-in users
- `src/presence/SmartRoot.tsx`: when `user` is present, render `<Navigate to="/home" replace />` (inside `OnboardingGate`) instead of `ShellV2`. Unauthenticated `/` keeps the public `Index` (MindHackerLanding).
- Net effect: logged-in `/` → `/home`. `/home` renders the client coach app (see step 3), not the AION chat shell.

### 3. Make `/home` a real client coach home (not the public marketing page, not chat)
Currently `/home` renders `MindHackerLanding`, which is the public marketing site. For a logged-in client of the coach, the home should be the coach app:
- Create `src/pages/ClientHome.tsx` that composes existing components only (no new business logic):
  - Hero: founder/coach intro pulled from the existing `MindHackerLanding` hero block, simplified (no public CTAs like "book intake").
  - "המסע שלך" row: shortcut cards → `/courses`, `/community`, `/me`, and (admin-only) `/admin-hub`. Uses the same icons already in `DesktopSideNav`.
  - Catalog strip: reuse the existing course grid from `src/pages/Courses.tsx` (top 3–6 items) via the existing course-catalog hook/service (`services/courseCatalog.ts`).
  - Coach card: reuse `PractitionerProfileHeader` from `src/components/practitioner-landing` to show the founder as the user's coach.
- Mount `<Route path="/home" element={<ClientHome />} />` (replaces the current `MindHackerLanding` mount for `/home`). `MindHackerLanding` stays as the public landing for `/` when logged out.

### 4. Keep the chat as a floating widget only (no full-screen AION shell on `/home`)
- The floating `InteractiveAIONHost` is already mounted globally in `App.tsx` (line 290) and renders on every protected route — keep it.
- Do NOT mount `ShellV2`'s chat layer on `/home`. Since `/home` is now `ClientHome`, the AION composer/header no longer fills the screen; only the floating orb remains.

### 5. Remove "AION" branding from the client home chrome
- `src/shellv2/ShellHeader.tsx` / `ShellV2Header.tsx`: when the active route is `/home` (or any non-chat client surface), render the coach/app name instead of the literal string "AION". Use the existing brand label already used on the public landing (Exire Systema / coach display name) — no new copy.
- The floating orb's tooltip/label keeps the personal AION display name via `useAIONDisplayName` (that's the user's private AI, fine).
- Composer placeholder: when the chat is summoned as an overlay it can keep "Message AION…"; on the home surface there is no composer at all (step 4).

### 6. Cleanup
- `src/pages/Index.tsx`: leave `<Navigate to="/home" />` for logged-in (now works because step 1 stops the loop).
- `src/navigation/canonicalSurfaces.ts`: `home` surface already points to `/home`; no change needed.
- Verify `/me`, `/courses`, `/community`, `/admin-hub` still resolve through the existing nav.

## Out of scope

- No DB / RLS / edge function changes.
- No changes to how AION actually answers (canonical `aurora-chat` pipeline untouched).
- No rework of `ShellV2` itself — it stays available for the explicit chat overlay; it just isn't the default home anymore.
- No new copy beyond what already exists in `MindHackerLanding` / `PractitionerProfileHeader`.

## Files touched

- edit: `src/routes/redirects.tsx`
- edit: `src/presence/SmartRoot.tsx`
- edit: `src/App.tsx` (swap `/home` element)
- edit: `src/shellv2/ShellHeader.tsx` and/or `ShellV2Header.tsx` (brand label on home)
- new:  `src/pages/ClientHome.tsx`

## Open question

The coach app currently has one coach (the founder). Should the home "Your coach" card always show the founder, or auto-pick the coach the logged-in user actually subscribed to via `useCoachSubscription`? Default below is: show the founder always; switch to subscribed coach only if one exists.
