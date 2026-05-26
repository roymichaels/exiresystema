# Switch logged-in default to the client view

Right now, after login everyone lands on `/workspace` (CoachHub) and the side-nav is coach-shaped (Workspace · Clients · Content · Marketing · Admin · Profile). Even you, the coach, should see the **client-side experience by default** — the same thing your members see when they sign in. The coach/admin tools already live inside `/admin-hub`; the canonical nav should just point there for admins, not replace the main app.

## What the client view is

Reusing what already exists (no new pages):

- **Home** → coach landing / member home (`MindHackerLanding` content, but as the logged-in shell — i.e. the coach's public site is the client home)
- **Courses** → `/courses` (existing `Courses.tsx` + `CourseDetail` + `CourseWatch`)
- **Messages** → `/messages` (existing `Messages.tsx`, chat with the coach, not AION)
- **Community** → `/community` (existing)
- **Profile** → `/me` → user's own profile (`ProfilePage.tsx`)
- **Admin** → `/admin-hub` (only rendered in nav if the user has the admin role — that's you)

## Changes

### 1. Post-login redirect — `src/pages/Index.tsx`
- Change `<Navigate to="/workspace" replace />` → `<Navigate to="/home" replace />` (new client home route).

### 2. New `/home` route — `src/App.tsx`
- Add `/home` as a `ProtectedRoute` rendering the coach's landing content (`MindHackerLanding`) inside the protected shell, so members get the coach's site as their home base.
- Keep `/landing` (public landing) untouched.

### 3. Canonical nav — `src/navigation/canonicalSurfaces.ts`
Replace coach-shaped surfaces with client-shaped surfaces:

| id | path | icon | label |
|---|---|---|---|
| home | `/home` | Home | Home |
| courses | `/courses` | GraduationCap | Courses |
| messages | `/messages` | MessageSquare | Messages |
| community | `/community` | Users | Community |
| profile | `/me` | User | Profile |

No `admin`/`workspace`/`clients`/`marketing`/`content` entries in the canonical surface list.

### 4. Admin entry — `src/components/navigation/DesktopSideNav.tsx` (+ mobile equivalent)
Append an **Admin** nav item *only when* the current user is an admin (use existing `useUserRole` / `AdminRoute` check). The item links to `/admin-hub`. This keeps all coach/marketing/content/integrations tools where they already are — inside the admin hub — and out of every client's UI.

### 5. Redirect cleanup — `src/routes/redirects.tsx`
Reverse the AION→workspace mappings I added previously:
- `/now`, `/plan`, `/play`, `/play-hub`, `/tactics`, `/arena`, `/dashboard`, `/hallway*`, `/work*`, `/journal-hub`, `/life*`, `/career`, `/creator-hub`, `/freelancer-hub`, `/mindos*` → `/home` (not `/workspace`)
- `/chat` → `/messages` (chat with coach, not the clients tab)
- `/profile`, `/profile-hub`, `/me/coach` (legacy) → `/me`
- Keep `/workspace` working (renders CoachHub) but only admins reach it (via the nav item / direct link).

### 6. CoachHub access — `src/App.tsx`
Wrap `/workspace` and `/me/coach` with `AdminRoute` so only the coach/admin can open the coach console. Non-admin clients who hit those URLs bounce to `/home`.

### 7. realmMood — `src/aion/realms/realmMood.ts`
Update the surface→mood keys back to client surfaces (`home`, `courses`, `messages`, `community`, `profile`, plus `admin`).

## What stays the same

- `/admin-hub` and everything inside it (Coach · Marketing · Content · System tabs incl. Integrations, CRM, leads) — no changes.
- AION pages (`/aurora`, `/brain`, `/journey`, `/outer-world`, `/strategy`, `/hypnosis`, `/journal`) — still mounted and reachable, just not in the default nav.
- Public landing (`/`, `/landing`), course/coach public pages — unchanged.
- No schema, no edge functions, no new components.

## Open question

For the logged-in **Home** screen — do you want:

- **A.** The exact same `MindHackerLanding` content the public sees (just inside the app shell), or
- **B.** A trimmed "member home" (welcome + continue-watching from `/courses` + latest message from coach + upcoming sessions)?

Default if you don't answer: **A** (fastest, reuses existing landing). I can ship B as a second pass.
