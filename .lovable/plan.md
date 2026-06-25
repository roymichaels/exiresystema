
# XSYSTEM Pivot — Audit & Phase 2 Plan (no code)

## 1. XSYSTEM Current State

**Tables (already created in Phase 1):**
- `public.clients` — practitioner_id, lead_id, user_id, full_name, email, phone, whatsapp, instagram_handle, manychat_id, language, birthday, tags[], status, risk_flags jsonb, consent jsonb, notes.
- `public.client_profiles` — client_id, goals jsonb, presenting_issues jsonb, subconscious_summary, last_updated_by.

**Files:**
- `src/hooks/useClients.ts` — `useClients`, `useClient`, `useClientProfile`, `useCreateClient`, `useUpdateClient`, `useConvertLeadToClient` (idempotent on practitioner_id+lead_id; flips lead.status='converted').
- `src/components/admin/clients/XSystemClientsTab.tsx` — list + search; opens `/clients/:id`.
- `src/pages/ClientDetail.tsx` — header card + 8 tabs (only "סקירה/Overview" enabled; rest disabled placeholders).
- `src/App.tsx` — `/clients/:id` route.
- `src/components/crm/LeadsCRM.tsx` — "המר ללקוח XSYSTEM" button using `useConvertLeadToClient`.
- `src/domain/admin/tabConfig.ts` — `coach > xsystem-clients` tab.

**Reused legacy systems (not XSYSTEM-native yet):**
- Leads pipeline: `public.leads`, `public.lead_activity`, `src/hooks/useLeads.ts`, `src/hooks/useLeadActivity.ts`, `src/pages/admin/Leads.tsx`, `LeadsCRM.tsx`.
- Forms: `public.custom_forms`, `public.form_fields`, `public.form_submissions`, `public.form_analyses`; `src/pages/admin/Forms.tsx`, `src/components/admin/forms/*`, `src/pages/PublicForm.tsx`, edge fn `generate-form`.
- Recordings: `public.hypnosis_audios`, `public.hypnosis_videos`, `public.user_audio_access`, `public.user_video_access`; `src/components/admin/recordings/*`.
- Practitioner legacy (separate marketplace model, do NOT use for XSYSTEM): `practitioners`, `practitioner_clients`, `practitioner_client_profiles`, `practitioner_services`, `practitioner_settings`, `bookings`, `coach_*`.

## 2. Gap Analysis

| Area | Status | Notes |
|---|---|---|
| Leads | exists | `leads` + `LeadsCRM` good as-is. |
| Lead activity | exists | `lead_activity` + `useLeadActivity` good. |
| Lead → client conversion | exists | `useConvertLeadToClient` works; needs visible link from lead row to created client. |
| Client profiles | partial | `clients` + `client_profiles` exist; UI only shows header + notes. No edit form for goals/presenting issues. |
| Intake forms | partial | `custom_forms` works standalone; no link `form_submissions.client_id` and no "attach submission to client" flow. |
| Session notes | missing | No table, no UI. |
| Beliefs | missing | — |
| Patterns | missing | — |
| Inner parts | missing | — |
| Rooms model | missing | — |
| Protocol library | missing | (custom_protocols exists but is legacy/unused-for-XSYSTEM — keep, don't reuse). |
| Personalized audio assignments | partial | `hypnosis_audios` + `user_audio_access` exist but key on user_id, not client_id. Need client-scoped assignment table. |
| Check-ins | missing | — |
| Follow-ups | missing | — |
| Payments/offers | partial-quarantine | `purchases`, `orders`, `offers`, `coupons` exist but tied to marketplace/courses. XSYSTEM needs a thin practitioner-scoped `xsystem_payments`. |
| Dashboard / action queue | missing | No "today" view for practitioner across clients. |
| Legacy AION/Aurora/Worlds/FM/Gamification | exists — should be hidden | See §6. |

## 3. Recommended Core Data Model (Phase 2A)

Convention: all rows owned by `practitioner_id uuid` (= `auth.uid()` of coach) and reference `client_id uuid references public.clients(id) on delete cascade`. RLS: practitioner can CRUD own rows via `practitioner_id = auth.uid()`; `service_role` full. No anon. All tables get `created_at`, `updated_at`, `update_updated_at_column` trigger, and GRANTs to `authenticated` + `service_role`.

1. **xsystem_sessions** — one coaching session.
   - Fields: `client_id`, `practitioner_id`, `session_number int`, `scheduled_at timestamptz`, `started_at`, `ended_at`, `duration_minutes int`, `mode text` (in_person|zoom|whatsapp|async), `status text` (scheduled|completed|cancelled|no_show), `summary text`, `recording_audio_id uuid → hypnosis_audios.id null`.
   - Parent of session_notes, session_protocols.

2. **xsystem_session_notes** — structured per-session entries.
   - Fields: `session_id`, `client_id`, `practitioner_id`, `kind text` (observation|insight|homework|next_step|risk), `body text`, `tags text[]`.

3. **xsystem_beliefs** — limiting/empowering beliefs surfaced.
   - Fields: `client_id`, `practitioner_id`, `belief text`, `polarity text` (limiting|empowering|neutral), `strength int 1-10`, `source_session_id uuid null`, `status text` (active|reframed|archived), `reframe text null`, `evidence jsonb`.

4. **xsystem_patterns** — recurring behavioral/emotional loops.
   - Fields: `client_id`, `practitioner_id`, `name text`, `description text`, `trigger text`, `loop jsonb` (trigger→thought→feeling→action), `frequency text`, `severity int 1-10`, `status text`, `linked_beliefs uuid[]`.

5. **xsystem_inner_parts** — IFS-style parts.
   - Fields: `client_id`, `practitioner_id`, `name text`, `role text` (protector|exile|manager|firefighter|other), `voice text`, `intent text`, `age_origin text`, `relationship_to_self text`, `status text` (unblended|blended|integrated), `notes text`.

6. **xsystem_rooms** — practitioner-defined room templates (subconscious metaphor space).
   - Fields: `practitioner_id`, `name text`, `slug text`, `description text`, `intent text`, `default_protocol_ids uuid[]`, `order_index int`, `is_archived bool`.
   - No `client_id` — global to practitioner.

7. **xsystem_client_rooms** — per-client room state.
   - Fields: `client_id`, `practitioner_id`, `room_id uuid → xsystem_rooms`, `state text` (locked|open|active|completed), `entered_at`, `completed_at`, `notes text`.
   - Unique (client_id, room_id).

8. **xsystem_protocols** — reusable protocol library.
   - Fields: `practitioner_id`, `title text`, `slug text`, `category text` (induction|regression|parts_work|reframe|anchoring|integration|homework), `body text` (markdown), `steps jsonb`, `default_duration_minutes int`, `audio_id uuid → hypnosis_audios null`, `is_archived bool`.

9. **xsystem_session_protocols** — protocols applied in a session.
   - Fields: `session_id`, `protocol_id`, `client_id`, `practitioner_id`, `order_index int`, `outcome text`, `notes text`.

10. **xsystem_audio_assignments** — assign hypnosis audio to client.
    - Fields: `client_id`, `practitioner_id`, `audio_id uuid → hypnosis_audios`, `assigned_at`, `due_at`, `frequency text` (once|daily|weekly|nightly), `instructions text`, `status text` (active|paused|done), `last_played_at`, `play_count int`.
    - Optional sync trigger: on insert, also insert into `user_audio_access` when `clients.user_id` is not null.

11. **xsystem_checkins** — client self-reports between sessions.
    - Fields: `client_id`, `practitioner_id`, `kind text` (mood|sleep|practice|free|form_submission), `payload jsonb`, `mood int 1-10`, `notes text`, `form_submission_id uuid → form_submissions null`, `submitted_at`.

12. **xsystem_followups** — practitioner action queue.
    - Fields: `client_id`, `practitioner_id`, `title text`, `body text`, `due_at timestamptz`, `priority text` (low|normal|high), `status text` (open|done|snoozed), `done_at`, `source text` (manual|session|checkin|form|payment).

13. **xsystem_payments** — practitioner-scoped payment log (decoupled from marketplace).
    - Fields: `client_id`, `practitioner_id`, `amount_cents int`, `currency text default 'ILS'`, `kind text` (session|package|upsell|deposit|refund), `paid_at timestamptz`, `method text` (cash|bit|paybox|stripe|other), `external_ref text`, `notes text`, `status text` (pending|paid|refunded|void).

**Connections to existing tables:**
- `form_submissions` — add nullable `client_id uuid` + `practitioner_id uuid` columns and an admin "attach to client" action. Surface in `xsystem_checkins.form_submission_id`.
- `hypnosis_audios` — referenced read-only by `xsystem_audio_assignments` and `xsystem_protocols`.
- `leads` — already linked via `clients.lead_id`.

**RLS pattern (all 13 tables):**
```
USING  (practitioner_id = auth.uid())
WITH CHECK (practitioner_id = auth.uid())
```
Plus a future-friendly read for `clients.user_id = auth.uid()` only on `xsystem_audio_assignments` and `xsystem_checkins` (so the client portal can read their own).

## 4. ClientDetail Redesign (`/clients/:id`)

Tabs (in order):

| Tab | Reads | Writes | Coach actions | Build phase |
|---|---|---|---|---|
| Overview | clients, client_profiles, latest session, open followups count, payments total | client_profiles, clients.notes | Edit notes, goals, presenting issues, status, tags | 2C/2D |
| Intake | form_submissions WHERE client_id=… | form_submissions.client_id | Attach existing submission, send form link via WA | 2C + form FK |
| Sessions | xsystem_sessions, xsystem_session_notes, xsystem_session_protocols | all three | New session, complete, add note, attach protocol, attach recording | 2D |
| Beliefs | xsystem_beliefs | xsystem_beliefs | Add, reframe, archive | 2E |
| Patterns | xsystem_patterns | xsystem_patterns | Add, link beliefs, mark resolved | 2E |
| Inner Parts | xsystem_inner_parts | xsystem_inner_parts | Add, change status | 2E |
| Rooms | xsystem_rooms (templates) + xsystem_client_rooms | xsystem_client_rooms | Open/complete room | 2E |
| Protocols | xsystem_protocols (catalog) + xsystem_session_protocols history | xsystem_session_protocols | Quick-apply to last session | 2E |
| Audio | xsystem_audio_assignments + hypnosis_audios | xsystem_audio_assignments | Assign, set frequency, pause | 2F |
| Check-ins | xsystem_checkins | xsystem_checkins | Add manual, view chart | 2F |
| Payments | xsystem_payments | xsystem_payments | Log payment, refund, sum | 2G |
| Timeline | union of sessions+notes+checkins+payments+followups | — | Read-only chronological feed | 2G |

Action header (always visible): WhatsApp, Call, Email, "+ סשן חדש", "+ צ׳ק־אין", "+ תשלום", "+ משימה".

## 5. Safe Implementation Plan

- **2A — DB schema only.** One migration creates the 13 tables + GRANTs + RLS + update triggers; adds `client_id`, `practitioner_id` nullable to `form_submissions` with index. No app changes.
- **2B — Types/hooks only.** `src/hooks/xsystem/` with `useSessions`, `useSessionNotes`, `useBeliefs`, `usePatterns`, `useInnerParts`, `useRooms`, `useClientRooms`, `useProtocols`, `useAudioAssignments`, `useCheckins`, `useFollowups`, `usePayments`. Pure data layer, no UI imports.
- **2C — ClientDetail tabs with empty states.** Enable all tabs; each renders count + empty state + "Add" disabled. Add Overview edit form for client_profiles.
- **2D — Sessions + session notes.** New/complete session sheets, notes list, attach recording from `hypnosis_audios` picker.
- **2E — Beliefs / Patterns / Parts / Rooms / Protocols.** Inline add dialogs + list cards.
- **2F — Check-ins + Audio assignments.** Audio assignment dialog with frequency; checkin mood chart; form-submission → checkin link.
- **2G — Payments + Followups + Dashboard action queue.** New admin tab "XSYSTEM Today" aggregating open followups, today's sessions, overdue check-ins, unpaid balances across all clients of the practitioner.

Each phase = one PR-sized change, no cross-phase dependencies beyond the previous.

## 6. Legacy Boundary

Keep, do not touch, do not delete:
- AION (`src/aion/**`, `src/identity/**`, `aion_*` tables)
- Aurora (`src/contexts/Aurora*`, `aurora_*` tables, `aurora-chat` edge fn)
- Worlds (`src/worlds/**`, `src/world/**`, `src/hallway/**`, `src/selfworld/**`)
- Freemarket (`fm_*` tables, FM hub)
- Gamification (xp_events, skills, skill_xp_events, energy_events, action_items, plan_missions, today_runs, life_plans, mission_templates)
- Courses (learning_*, content_*, course_enrollments)
- Marketplace (practitioners, practitioner_*, bookings, coach_*, offers, orders, purchases, products, coupons)
- Public marketing pages (`/`, `/home`, `/landing`, `/founding`, `/blog`, etc.)

**Recommended hide-only (Phase 2G or later, behind `VITE_XSYSTEM_MODE=true`):**
- Admin tabs not needed by Exire Systema internal ops: Courses, Marketplace Coaches admin, FM/Tokenomics, Worlds dev tools, AION dev/diagnostics — hide from `src/domain/admin/tabConfig.ts` only; do not unmount providers, do not drop routes.
- User-facing nav: gate `/me`, `/worlds`, `/play`, `/career`, `/learn`, `/free-market` behind the same flag so the only end-user surface remains the optional client portal once built (Phase 3+).

Nothing in this plan deletes code, migrates legacy data, or changes any AION/Aurora/Worlds/FM/Gamification logic.

## What I need from you to proceed
1. Approve §3 table list + names (esp. `xsystem_` prefix vs. shorter names like `sessions`/`beliefs` — prefix is safer given 208 existing tables).
2. Approve §4 tab order and the 12-tab scope.
3. Confirm payments stays decoupled (`xsystem_payments`) rather than reusing `purchases`.
4. Confirm I should proceed phase-by-phase with explicit approval before each (start with 2A).
