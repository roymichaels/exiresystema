## Goal

Use only the homepage's persistent floating chat widget (AION presence + GlobalChatInput) as the single chat surface across the app. Remove the dedicated `/messages`, `/messages/:id`, and legacy `/chat` pages plus their nav entry.

## Changes

1. **Navigation (`src/navigation/canonicalSurfaces.ts`)**
   - Remove the `messages` surface from `CANONICAL_SURFACES`.
   - Final nav: Home, Courses, Community, Profile (+ Admin for admins).
   - Update `LEGACY_TO_SURFACE`: map `/messages`, `/chat`, `/mindos/chat`, `/messages/ai` → `/home` so any old link opens the home with the global widget available.

2. **Routes (`src/App.tsx`)**
   - Delete the `<Route path="/messages" …>` and `<Route path="/messages/:conversationId" …>` lines.
   - Drop the `Messages` and `MessageThread` lazy imports.
   - Add a catch redirect `/messages/*` → `/home` (handled via the legacy redirect map updated above; no extra route needed).

3. **Legacy redirects (`src/routes/redirects.tsx`)**
   - Repoint `'/chat' → '/home'`, `'/mindos/chat' → '/home'`, `'/messages/ai' → '/home'`.
   - Add `'/messages' → '/home'` and `'/messages/:conversationId' → '/home'`.

4. **Dead-file cleanup (safe deletes)**
   - Delete `src/pages/Messages.tsx` and `src/pages/MessageThread.tsx` once unreferenced.
   - Leave `ConversationItem`, `NewMessageDialog`, `services/messaging.ts`, and the `conversations`/`messages` tables untouched (no DB changes — DM data preserved in case it's reintroduced later).

5. **Widget availability check**
   - Confirm the floating AION widget (`InteractiveAIONHost` + `GlobalChatInput`, already mounted in `App.tsx` / ShellV2) renders on every protected route including `/home`, `/courses`, `/community`, `/me`, `/admin-hub`. No new mounts needed — it's already global.

## Out of scope

- No DB schema changes; existing `conversations`/`messages` tables are retained.
- No changes to the admin coach inbox (lives under `/admin-hub`).
- Coach↔client direct messaging UI is removed from the client-facing nav. If you want clients to message the coach specifically (not the AI), say so and I'll add a "Message coach" entry point that opens the same global widget pre-targeted to the coach thread.

## Files touched

- edit: `src/navigation/canonicalSurfaces.ts`
- edit: `src/App.tsx`
- edit: `src/routes/redirects.tsx`
- delete: `src/pages/Messages.tsx`, `src/pages/MessageThread.tsx`
