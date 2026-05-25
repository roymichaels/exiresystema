# Plan — Turn the logged-in app into the Private Coach app

## Goal

After login, the user (the coach) should land in a coach command center — not the AION Chat/Brain/Journey/Outer-World/Profile shell. We reuse what already exists (`CoachHub`, `AdminHub`, `PractitionerProfile`, `Courses`, `CoachProductsTab`, `CoachLandingPagesTab`, `CoachPricingPage`, etc.) and don't build new screens. AION brain, presence, hallway, world-runtime etc. stay in the codebase — they continue to power the public landing page, the admin AI features (Aurora Insights, Chat Assistant, content/copy generation), and underlying coach intelligence. They just stop being the navigation the coach sees.

## Current state (verified)

- After login, `Index.tsx` does `Navigate to="/now"` → `redirects.tsx` maps `/now` → `/journey` (AION's "Journey" surface).
- `DesktopSideNav` + the mobile equivalents render the 5 canonical AION surfaces from `src/navigation/canonicalSurfaces.ts`: **Chat, Brain, Journey, Outer World, Profile** — none of which are coach-shaped.
- The coach functionality already exists and is solid:
  - `src/pages/CoachHub.tsx` — overview, clients, leads, products, content, plans, marketing, analytics, landing pages, settings, profile preview.
  - `src/pages/AdminHub.tsx` + `src/domain/admin/tabConfig.ts` — already collapsed to 4 tabs (Coach / Marketing / Content / System) per the prior pass.
  - `src/pages/PractitionerProfile.tsx` — public coach profile.
  - `src/pages/Coaches.tsx` → currently routes to `CareerHub` ("become a coach" funnel) — irrelevant in a single-coach app.
  - `Courses` / `CourseDetail` / `CourseWatch` — usable as the coach's course catalog.
  - `Integrations` page — already unified.

## Strategy

Strip the AION surfaces from the **logged-in shell only**, and route the coach into the coach workspace instead. No deletions of AION code — those pages remain reachable from admin tools / advanced routes, and the brain still powers AI features behind the scenes.

### 1. Change the post-login landing

- `src/pages/Index.tsx`: replace `<Navigate to="/now" replace />` with a redirect to the new coach workspace root (`/workspace`, alias of `/coach-hub`). Use a single constant so we can flip it later.
- Add `/workspace` to `App.tsx` as a `ProtectedRoute` rendering `CoachHub`.

### 2. Replace the 5 canonical surfaces with coach surfaces

Rewrite `src/navigation/canonicalSurfaces.ts` so the side/bottom nav now exposes the coach's daily tools (all already exist):

```text
Workspace   → /workspace      (CoachHub overview + tab pills)
Clients     → /workspace?tab=clients
Content     → /workspace?tab=content   (products, courses, blog, recordings)
Marketing   → /workspace?tab=marketing (landing pages, offers, theme, FAQs)
Admin       → /admin-hub                (already 4-tab collapsed)
Profile     → /me/coach                  (PractitionerProfile of the current coach via storeSlug)
```

`CoachHub` already drives the tabbed inner UI, so the nav can just deep-link via `?tab=` (a tiny adjustment in `CoachHub` to read `tab` from `useSearchParams` on mount).

### 3. Add legacy aliases instead of deleting AION routes

In `src/routes/redirects.tsx` and `LEGACY_TO_SURFACE`, redirect the now-unused user-facing AION surfaces into the coach workspace:

```text
/         → /workspace   (when authed; Index handles this)
/journey  → /workspace
/now      → /workspace
/chat     → /workspace?tab=clients   (coach uses CRM, not AION chat)
/outer-world → /workspace?tab=marketing
/profile  → /me/coach
/brain    → keep — power-user/admin tool, link only from AdminHub → System
```

This keeps deep links alive, hides AION from the daily UI, and preserves the Brain page for admin use.

### 4. Coach profile route

- Add `/me/coach` → resolves current user's `storeSlug` (via `useMyCoachProfile` + `useFirstCoachSlug`, already used in `CoachHub`) and renders the existing `PractitionerProfile` content (`PractitionerProfileHeader` + `PractitionerFeedTabs`) inside the logged-in shell — exactly what `CoachHub`'s profile dialog already does, just on a dedicated page.

### 5. Retire the "Become a coach" funnel for the single-coach app

- `Coaches.tsx` currently renders `CareerHub` (multi-coach marketplace funnel). For a single-coach template, change `/coaches` to redirect to `/workspace`. The public marketplace UI components (`CoachesLanding`, `PractitionerProfile`) remain available for the public site.

### 6. Shell chrome

- The shell (`ProtectedAppShellV2`, `ShellV2Header`, `DesktopSideNav`) stays as is — it already reads `CANONICAL_SURFACES`. Once that array is the coach surfaces (step 2), the chrome auto-updates: same logo at top, new icons/labels for the nav.
- Keep `SharedOrbStage` / `InteractiveAIONHost` / `PersistentWorldOrb` mounted — they power the admin "AI assistant" widgets and the public landing. They render conditionally; on coach workspace routes we can short-circuit them with the existing `ChromeVisibilityContext` so the coach doesn't see floating AION orbs while working.

### 7. Touch list (no new files, only edits)

- `src/pages/Index.tsx` — post-login redirect target.
- `src/App.tsx` — add `/workspace` and `/me/coach` routes; keep AION routes mounted.
- `src/navigation/canonicalSurfaces.ts` — replace 5 entries with the coach surfaces above; update `LEGACY_TO_SURFACE`.
- `src/routes/redirects.tsx` — point `/now`, `/journey`, `/chat`, `/outer-world` to `/workspace`.
- `src/pages/CoachHub.tsx` — read `?tab=` from URL on mount so deep-links from the nav work.
- `src/pages/Coaches.tsx` — redirect to `/workspace` in single-coach mode.
- `src/contexts/ChromeVisibilityContext` consumer in `ProtectedAppShellV2` — hide floating AION orb on `/workspace`, `/admin-hub`, `/me/coach`.

### 8. What is explicitly NOT changed

- No deletion of `BrainPage`, `AuroraPage`, `HallwayShell`, `worlds/*`, `selfworld/*`, `presence/*`, `aion/*`, `identity/*`. They keep powering admin AI features and the public landing page.
- No new components, no new tables, no new edge functions.
- `AdminHub` already collapsed — no further restructure here.

## Open question for you (one)

For the single-coach template, do you want `/brain` to stay reachable for the coach (as a power-user "intelligence/insights" tool, linked from Admin → System), or should `/brain` also redirect into `/admin-hub?tab=system&sub=integrations` and become invisible to the coach? Default in this plan: **keep it reachable but unlinked** — easy to flip either way in `redirects.tsx`.

