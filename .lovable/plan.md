# XSYSTEM / Exire Systema — Full App Audit (Plan Mode)

This is a read-only audit of the current codebase plus a phased migration plan. No code changes are made here.

> Assumption (called out per spec): you, the founder, are the sole "practitioner" in the near term. The audit treats multi-coach features (marketplace, public coach profiles, Stripe coach subscriptions) as non-XSYSTEM unless you say otherwise.

---

## 1. Project Inventory

**Stack** (from `package.json`, `vite.config.ts`, `src/integrations/supabase/client.ts`):
- React 18 + Vite 5 + TypeScript + Tailwind + shadcn/ui (Radix).
- Routing: `react-router-dom` in `src/App.tsx` (~528 lines, dozens of lazy routes).
- State/data: `@tanstack/react-query`, multiple React Contexts under `src/contexts/*` (Auth, Language, Aurora, Sidebar, Profile, Subscriptions, Wallet, SmartOnboarding, AION, StoryWorld, etc.).
- Backend: Lovable Cloud (Supabase) — `src/integrations/supabase/client.ts`, ~90 edge functions in `supabase/functions/*`.
- Auth: `AuthContext` (email/password + social) plus `@web3auth/modal` (`src/providers/Web3AuthProviderWrapper.tsx`).
- AI: Lovable AI Gateway (`ai`, `@ai-sdk/*`), ElevenLabs (`elevenlabs-tts`, `elevenlabs-transcribe`).
- 3D / visuals: `@react-three/fiber`, `drei`, `postprocessing`, custom Orb/world stack under `src/worlds/*`, `src/universe/*`, `src/aion/*`, `src/orchestration/*`.
- Payments: Stripe (`create-checkout-session`, `stripe-webhook`, `customer-portal`).
- Messaging: `send-whatsapp`, `send-welcome-email`, `process-email-queue`, newsletter functions.
- Docs already in repo: `AUDIT_P2_ARCHITECTURE.md`, `AUDIT_P3_DEPENDENCIES.md`, `AUDIT_P4_PERFORMANCE.md`, `LAUNCHPAD_AUDIT.md`, `WAVE1_CLEANUP_REPORT.md`, `CODEBASE_ANALYSIS.md`, `management/*`.

**Top folders by weight** (`src/`):
- `pages/` — 60+ top-level pages incl. `admin/`, `MindOS/`, `dev/`, `fm/`, `panel/`, `pillars/`.
- `components/` — ~742 files across `admin`, `aurora`, `aurora-ui`, `crm`, `landing`, `community`, `careers`, `coaches`, `courses`, `fm`, `game`, `gamification`, `hypnosis`, `journey`, `journeys`, `launchpad`, `dna`, `avatar`, `founding`, `orb`, etc.
- `hooks/` — ~70 hooks (leads, journeys, aurora, fm, launchpad, coaches, …).
- `worlds/`, `universe/`, `aion/`, `presence/`, `selfworld/`, `shellv2/`, `orchestration/`, `viewIdentity/`, `identity/`, `hallway/`, `flows/pillarSpecs/` — the Mind-OS "cognitive worlds" engine.
- `supabase/functions/` — 90 functions; many are Mind-OS gameplay (`generate-100day-strategy`, `generate-tactical-schedule`, `aion-brain`, `fm-*`, `course-orchestrator`).

**Active dead-code signal**: `npm run audit:dead` already exists (`scripts/audit-deadcode.mjs`) and currently flags many orphans — see §4.

## 2. Current App Map (user-visible)

Routes registered in `src/App.tsx`:

Public:
- `/` (`SmartRoot`), `/landing` (`Index` — MindHacker/Exire landing), `/founding`, `/blog`, `/blog/:slug`, `/courses`, `/courses/:slug`, `/courses/:slug/watch`, `/subscriptions`, `/install`, `/privacy-policy`, `/terms-of-service`, `/affiliate-signup`, `/ceremony`, `/go`, `/features/:slug`, `/aion`, `/aion-chat` (lead-capture intake), `/audio/:token`, `/video/:token`, `/form/:token`, `/practitioner/:slug`→ redirect, `/unsubscribe`, `/docs`.

Authenticated app shell (`ProtectedAppShellV2`):
- `/aurora`, `/outer-world`, `/brain`, `/worlds/:worldId`, `/community`, `/community/post/:postId`, `/strategy` (+ `/journey`), `/hypnosis`, `/journal`, `/strategy/:pillar/*`, `/arena/:domainId/*`, `/home` (`ClientHome`), `/me`, `/workspace`/`/me/coach` (`CoachHub`, `MyCoachProfile` — admin-only), `/admin-hub`, `/launchpad/complete`, `/quests/:pillar`, `/learn`, `/fm`, `/fm/cashout`, `/fm/bridge`, `/coaching/journey[/:id]`, `/admin/journey[/:id]`, `/projects/journey[/:id]`, `/business`, `/business/journey[/:id]`, `/business/:businessId`, `/freelancer`, `/creator`, `/therapist`, `/career`, `/career/*`, etc.

Admin (`/admin-hub` → `AdminLayoutWrapper`, tabs from `src/components/admin/*` and `src/pages/admin/*`):
- Users, Leads (CRM + landing chat transcripts), Forms, Recordings (Audio + Video libraries, assignments, pending orders/payments), Coaches, Businesses, Career Applications, Content, Courses-via-Content, Products, Offers, Purchases, Testimonials, FAQs, Blog, Newsletter, Landing Pages + Builder, Homepage Sections, Theme, Menu, Settings, Notification Center, Bug Reports, Analytics, Affiliates, Aurora Insights, FM Bounties, Integrations, Work Monitor, Chat Assistant.

Major flows currently working:
- Lead capture via `IntakeChatModal` (intake-chat edge function) → `leads` table → `Leads` admin CRM (`LeadsCRM`).
- Custom forms (`custom_forms` + `form_fields` + `form_submissions` + `form_analyses`) viewable in `FormSubmissionsViewer` / `AllFormSubmissions`.
- Audio/video upload + token-gated playback (`hypnosis_audios`, `hypnosis_videos`, `user_audio_access`, `user_video_access`, `AudioPlayer`, `VideoPlayer`, `AssignAudio*Dialog`).
- Mind-OS "Game of Your Life": Aurora chat, AION orb, pillar quests, strategy maze, brain graph, worlds, FM market — large surface, mostly **not** XSYSTEM-relevant.

## 3. Existing Data Model (Supabase, public schema, ~190 tables)

XSYSTEM-relevant tables that already exist:

| Table | Purpose today | XSYSTEM fit |
|---|---|---|
| `leads` (25 cols, 7 policies) | Lead CRM. Fields: name, phone, email, source, status, notes, tags, metadata, … Used by `useLeads`, `LeadsCRM`. | **Direct reuse.** |
| `lead_activity` | Timeline events per lead. `useLeadActivity`. | Reuse. |
| `coach_leads` | Per-coach landing-page leads. Same shape as `leads`. | Redundant given solo use; can be deprecated or merged. |
| `custom_forms` / `form_fields` / `form_submissions` / `form_analyses` | Intake forms + AI analysis. `analyze-introspection-form`, `generate-form`. | **Direct reuse** as intake forms. |
| `hypnosis_audios` / `hypnosis_videos` | Library of personalized recordings. | **Direct reuse** as XSYSTEM audio library. |
| `user_audio_access` / `user_video_access` | Token-gated assignments to a user. | **Direct reuse** as AudioAssignment. |
| `hypnosis_sessions` / `hypnosis_script_cache` | Generated hypnosis content (`ai-hypnosis`, `generate-hypnosis-script`). | Reuse as Session/Protocol artifacts. |
| `bookings` + `practitioner_*` (services, availability, clients, settings, reviews, specialties) | Coach marketplace. | Mostly **remove or hide**; keep `bookings` + `practitioner_clients` if useful for client list. |
| `journal_entries` | Client journaling. | Reuse as integration check-ins / journaling. |
| `aurora_commitments`, `aurora_checklists`, `aurora_checklist_items`, `aurora_reminders`, `aurora_focus_plans`, `aurora_daily_minimums` | Aurora micro-tasks/reminders. | **Partial reuse** as Follow-up / Task / CheckIn (or replace with a single, clearer XSYSTEM model). |
| `profiles`, `user_roles`, `user_subscriptions`, `subscription_tiers`, `purchases`, `orders`, `coupons` | Identity, paywall, billing. | Reuse identity + billing; tiers can collapse later. |
| `email_*`, `newsletter_*`, `push_subscriptions`, `landing_chat_messages`, `visitor_sessions`, `page_views`, `conversion_events`, `exit_intent_leads` | Marketing/analytics. | Keep; useful for lead funnel. |
| 100+ Mind-OS tables: `action_items`, `today_runs`, `tactical_schedules`, `plan_missions`, `mission_templates`, `pillar_confidence`, `brain_edges`, `brain_evidence`, `aion_*`, `aurora_*` (most), `skill*`, `xp_events`, `loot_*`, `fm_*`, `consciousness_leap_*`, `community_*`, `course_*`, `learning_*`, `business_*`, `career_*`, `creator_*`, `freelancer_*`, `therapist_*`, `coaching_journeys`, `admin_journeys`, `creator_journeys`, … | Mind-OS gameplay, marketplace, gamification. | **Out of scope** for XSYSTEM core; keep dormant or sunset later. |

Missing XSYSTEM-specific tables: `clients` (vs leads), `client_sessions`, `session_notes`, `beliefs`, `patterns`, `inner_parts`, `rooms`, `audio_assignments` (semantic wrapper), `check_ins` (XSYSTEM-shaped), `follow_ups`, `protocols` (Exire Systema protocol library), `client_room_state`.

Local storage / mock data: small flags in onboarding/welcome gates; no significant mock layer that blocks migration.

## 4. Used vs Unused Code (from `npm run audit:dead` + route map)

**Actively used (keep, repurpose for XSYSTEM):**
- `src/pages/admin/Leads.tsx` + `src/components/crm/LeadsCRM.tsx` + `src/components/crm/LeadQuickActions.tsx` + `src/hooks/useLeads.ts`, `useLeadActivity.ts`.
- `src/pages/admin/Forms.tsx` + `src/components/admin/forms/*` + `supabase/functions/generate-form`, `analyze-introspection-form`.
- `src/pages/admin/Recordings.tsx` + `src/components/admin/recordings/*` + `get-audio-by-token`, `get-video-by-token`, `cache-hypnosis-audio`.
- `src/pages/PublicForm.tsx`, `AudioPlayer.tsx`, `VideoPlayer.tsx`.
- `src/components/landing/mindhacker/MindHackerLanding.tsx` + `IntakeChatModal` + `supabase/functions/intake-chat`.
- `src/pages/admin/Users.tsx`, `Settings.tsx`, `BugReports.tsx`, `Theme.tsx`.
- Core infra: `AuthContext`, `LanguageContext`, `i18n/*`, `integrations/supabase/*`, `ui/*`.

**Flagged orphan / low-value (dead-code report excerpt):**
- `src/navigation/osNav.ts`, `src/meta/appMap.ts`.
- `src/presence/*` (`ArtifactsDock`, `GraphCanvas`, `PresenceShell`, `StateTransition`, `presenceSignals`, `useActiveState`).
- `src/worlds/runtime/useCrossWorldResonance.ts`, `useWorldMomentum.ts`, `worlds/scene/AmbientGesture.tsx`, `WorldComposer.tsx`, `WorldStage.tsx`.
- `src/shellv2/dev/ShellV2MountDebug.tsx`, `shellv2/layers/ComposerLayer.tsx`, `src/shell/overlay/BottomSheet.tsx`.
- `src/lib/openclaw.ts`, `lib/web3auth.ts`, `lib/web3authConfig.ts`, `lib/adaptiveDifficulty.ts`, `lib/audioExtract.ts`, `lib/consciousness/levers.ts`, `lib/tools/extractDomainProfile.ts`, `lib/tools/supabaseQuery.ts`.
- Hooks: `useSignupEnabled`, `useSkillsProgress`, `useSwipeNavigation`, `useTodaysHabits`, `useUnreadBadge`, `useUserJob`, `useUserPlate`, `useUserPurchases`, `useWeeklyActivity`, `useRouteTheme` (audit-flagged).
- Admin pages flagged as not reachable from current admin nav: `admin/AuroraInsights.tsx`, `Businesses.tsx`, `CareerApplications.tsx`, `ChatAssistant.tsx`, `Coaches.tsx`, `FMBounties.tsx`, `LandingPageBuilder.tsx`, `Menu.tsx`, `WorkMonitor.tsx`, `Leads.tsx` (Leads is actually live — false positive; confirms audit script needs re-running before deletions).
- Pages off the new path: `CreatorHub`, `FreelancerHub`, `Creator`, `Freelancer`, `Business`, `BusinessDashboard`, `BusinessJourney`, `CareerHub`, `Coaches`, `CoachingJourney`, `Community*`, `Courses`, `CourseDetail`, `CourseWatch`, `OuterWorldHub`, `BrainPage`, `WorldRoute`, `ArenaHub`, `ArenaDomainPage`, `Learn`, `JournalingHub`, `JourneyView`, `PlayHub`, `LifeHub`, `LifeDomainPage`, `OrbGallery`, `MindOS/*`, `panel/*`, `pillars/*`, `dev/*`, `fm/*`, `AffiliateSignup`, `FoundingLanding` (unless still used for marketing).

**Duplicates / overlapping models:**
- `leads` vs `coach_leads` — two lead tables.
- Aurora `aurora_commitments` + `aurora_focus_plans` + `aurora_reminders` + `aurora_checklists` + `action_items` + `today_runs` + `plan_missions` — overlapping task/follow-up surfaces.
- `practitioners`, `practitioner_clients`, `practitioner_client_profiles`, `practitioner_services` — coach-marketplace duplicates of what XSYSTEM wants as a single `clients` model.
- Multiple "journey" tables (`admin_journeys`, `coaching_journeys`, `creator_journeys`, `business_journeys`, `freelancer_journeys`, `therapist_journeys`, `health_journeys`, `learning_journeys`, …) — Mind-OS journey engine; not XSYSTEM-relevant.

**Mock/demo:** `OrbGallery`, `dev/ShellV2DevPage`, sample blog content, founding landing avatars.

> Important: do not delete anything in Phase 1 — quarantine instead (route-stubbing + `__legacy/` folder move).

## 5. Fit Matrix — Current vs XSYSTEM

| XSYSTEM area | Status | Notes |
|---|---|---|
| Lead management | **Already exists** | `leads`, `LeadsCRM`, `lead_activity`, intake chat. Need: WhatsApp/Instagram/ManyChat sources, pipeline statuses tuned to your method. |
| Client management | **Partial** | `practitioner_clients` + `profiles` exist but are coach-marketplace shaped. Need first-class `clients` table or rename + migrate. |
| Intake forms | **Already exists** | `custom_forms` + AI analysis pipeline (`analyze-introspection-form`). Need XSYSTEM intake template. |
| Session management | **Partial** | `hypnosis_sessions`, `bookings` exist; no XSYSTEM "session" shape (date, type, room, transcript, audio link, outcomes). |
| Session notes | **Missing** | No structured note model. |
| Belief tracking | **Missing** | New entity required. |
| Pattern tracking | **Missing** | New entity required. |
| Inner parts | **Missing** | New entity required. |
| Rooms model | **Missing** | New entity + per-client room state. (Existing "rooms" in `src/hallway/rooms.ts` is the Mind-OS hallway — unrelated, do not confuse.) |
| Audio assignments | **Already exists** | `hypnosis_audios` + `user_audio_access` + token playback. Reuse, add `client_id`, `protocol_id`, due dates. |
| Check-ins | **Partial** | `journal_entries`, `aurora_commitments`, `daily_pulse_logs` exist. Need a single `check_ins` model scoped to a client/assignment. |
| Follow-ups / reminders | **Partial** | `aurora_reminders`, push subs, `send-whatsapp` exist. Need follow-up tasks tied to clients/sessions. |
| Business dashboard | **Partial** | Admin stats exist (`AdminStatsBar`, `Analytics`); not XSYSTEM-shaped (revenue per client, active protocols, etc.). |
| Future client portal | **Partial** | Auth + `ClientHome` route exist; needs XSYSTEM-specific client view (assignments, audios, check-ins, next session). |
| Mind-OS gameplay (worlds, brain, FM, quests, pillars, AION, hallway, gamification, coach marketplace, courses, community, careers, founding) | **Should be removed / hidden** | Out of scope; quarantine. |

## 6. Recommended Information Architecture

```
/login, /signup, /forgot                          (auth)
/                                                  → marketing landing (Exire Systema)
/intake/:formSlug                                  (public intake form — replaces /form/:token UX)
/audio/:token, /video/:token                       (keep token playback)

/app                                               (authenticated shell)
  /app/dashboard                                   business + practice KPIs
  /app/leads                                       CRM, pipeline, intake transcripts
  /app/clients                                     list + filters
    /app/clients/:id                               profile (overview, sessions, beliefs, parts, rooms, audios, check-ins, files, billing)
  /app/sessions                                    calendar/list across all clients
    /app/sessions/:id                              session detail + notes + outcomes
  /app/protocols                                   Exire Systema rooms + protocol library
    /app/protocols/rooms/:roomId
    /app/protocols/templates/:id                   reusable session/intake templates
  /app/forms                                       intake form builder + submissions
  /app/audio                                       library + assignments
  /app/check-ins                                   incoming check-ins across clients
  /app/follow-ups                                  tasks/reminders inbox
  /app/business                                    revenue, offers, purchases, payouts
  /app/settings                                    profile, integrations (WhatsApp/ManyChat/IG), branding, team

/client                                            (future client portal)
  /client/home, /client/sessions, /client/audio, /client/check-in, /client/messages
```

Reuses: `ProtectedAppShellV2` → keep as shell but strip Mind-OS chrome (orb/hallway/worlds). Reuses admin tabs for Leads/Forms/Recordings under the new IA.

## 7. Recommended Data Model

New tables / renames (additive — keep old tables until Phase 8):

- `clients` — `id`, `user_id?` (when portal invited), `lead_id?`, `full_name`, `phone`, `email`, `whatsapp`, `instagram_handle`, `manychat_id`, `language`, `birthday?`, `tags text[]`, `status` (active/paused/closed), `risk_flags jsonb`, `consent jsonb`, `created_at`, `updated_at`. RLS: practitioner-owned.
- `client_profiles` — `client_id`, `goals jsonb`, `presenting_issues jsonb`, `subconscious_summary text`, `last_updated_by`.
- `sessions` — `id`, `client_id`, `practitioner_id`, `scheduled_at`, `duration_min`, `mode` (in-person/zoom/whatsapp/async), `type` (intake/hypnosis/NLP/parts/visualization/integration), `room_id?`, `status`, `summary`, `transcript_url?`, `recording_audio_id?`.
- `session_notes` — `id`, `session_id`, `client_id`, `body_md`, `private boolean`, `created_by`.
- `beliefs` — `id`, `client_id`, `statement`, `polarity` (limiting/empowering), `origin`, `evidence`, `status` (active/transforming/integrated), `discovered_in_session_id?`, `linked_pattern_ids uuid[]`, `linked_part_ids uuid[]`.
- `patterns` — `id`, `client_id`, `name`, `description`, `trigger`, `response`, `outcome`, `frequency`, `status`.
- `inner_parts` — `id`, `client_id`, `name`, `role`, `voice`, `feelings`, `positive_intent`, `relationship_with_self`, `last_dialogue_at`, `status`.
- `rooms` — `id` (e.g. `safe_space`, `mirror`, `child`, `vault`, `future_self`, …), `name`, `purpose`, `default_protocol_id?`, `order_index`. (Catalog table — global, not per-client.)
- `client_room_state` — `client_id`, `room_id`, `entered_at`, `last_visited_at`, `notes`, `status`.
- `protocols` — `id`, `title`, `goal`, `room_id?`, `script_md`, `audio_template_id?`, `duration_min`, `tags`, `version`.
- `audio_assignments` — `id`, `client_id`, `audio_id` (FK `hypnosis_audios`), `protocol_id?`, `session_id?`, `assigned_at`, `due_at?`, `cadence` (one-off/daily/weekly/n×/week), `status`, `last_listened_at`, `listen_count`. Token playback uses existing `user_audio_access`.
- `check_ins` — `id`, `client_id`, `assignment_id?`, `session_id?`, `channel` (app/whatsapp/email), `mood int`, `energy int`, `sleep int`, `wins text`, `friction text`, `voice_note_url?`, `created_at`.
- `follow_ups` — `id`, `client_id`, `session_id?`, `due_at`, `kind` (message/call/review/booking), `channel`, `status`, `assignee_user_id`, `notes`.
- `offers` / `purchases` / `payments` — keep existing `offers`, `purchases`, `orders`, Stripe webhook.
- `integrations` — store ManyChat/WhatsApp/IG webhook secrets per practitioner (use existing secrets vault, not a public table).

Relationships:
```
leads 1—1 clients (on convert)
clients 1—N sessions, beliefs, patterns, inner_parts, audio_assignments, check_ins, follow_ups
sessions 1—N session_notes
rooms (catalog) 1—N client_room_state, protocols
protocols 1—N audio_assignments (template), sessions (template)
hypnosis_audios 1—N audio_assignments  ← reuses existing storage + token playback
```

All new public tables: GRANT to `service_role` always, `authenticated` for owner-scoped policies, no `anon`. RLS: row-owner = `practitioner_id` (your user id) via `has_role(auth.uid(),'admin')` or explicit `practitioner_id = auth.uid()`. Client portal access scoped by `client_id ↔ user_id` link.

## 8. Migration Strategy (phased, additive, reversible)

**Phase 1 — Audit + Quarantine (no deletes).**
- Re-run `npm run audit:dead`, save a fresh report under `docs/XSYSTEM_AUDIT.md`.
- Add a feature flag `VITE_XSYSTEM_MODE=true` + a route allow-list. Render only XSYSTEM routes when on; everything else 404 → keeps Mind-OS code on disk, off in UI.
- Move clearly-dead files (audit-confirmed) into `src/__legacy/` without deleting, behind a `// @ts-nocheck` shim, so we can revive if needed.
- Update memory: rename "Game of Your Life" Core rule to be Exire Systema brand-first.

**Phase 2 — Core data model.**
- Single migration: create `clients`, `client_profiles`, `sessions`, `session_notes`, `beliefs`, `patterns`, `inner_parts`, `rooms`, `client_room_state`, `protocols`, `audio_assignments`, `check_ins`, `follow_ups` + GRANTs + RLS + `updated_at` triggers.
- Seed `rooms` catalog with your Exire Systema rooms.
- Generate Supabase types.

**Phase 3 — Leads → Clients.**
- New `/app/leads` (reuse `LeadsCRM`) + "Convert to client" action (writes `clients` row, links `lead_id`).
- New `/app/clients` list + `/app/clients/:id` shell with empty tabs (Overview, Sessions, Beliefs, Patterns, Parts, Rooms, Audio, Check-ins, Notes, Files, Billing).
- Wire WhatsApp/IG/ManyChat source labels in `LeadsCRM`.

**Phase 4 — Sessions + Notes.**
- Sessions calendar + create/edit dialog.
- Session detail page with notes editor (Markdown), outcome capture, link to room/protocol, attach audio.
- Optional: import existing `hypnosis_sessions` rows.

**Phase 5 — Exire rooms + protocols.**
- `/app/protocols` library with room-grouped protocols.
- Per-client `Rooms` tab: visit history, current room, next room recommendation.
- Optional AI assist: reuse `aurora-chat`/`generate-hypnosis-script` re-skinned as "Protocol drafter" (no Mind-OS framing).

**Phase 6 — Beliefs / Patterns / Inner Parts.**
- CRUD on client tabs.
- Cross-linking UI (belief ↔ pattern ↔ part ↔ session).

**Phase 7 — Check-ins + Audio assignments + Follow-ups.**
- Audio assignment UI per client (reuses `hypnosis_audios` library and `user_audio_access` tokens).
- Check-in inbox + WhatsApp inbound capture (`send-whatsapp` already exists; add inbound webhook).
- Follow-ups inbox + scheduled reminders (reuse `aurora_reminders` or new table).

**Phase 8 — Dashboard, polish, retire Mind-OS.**
- XSYSTEM dashboard: active clients, sessions this week, overdue follow-ups, pending check-ins, revenue MTD.
- Hard-delete or archive `__legacy/` after 2 weeks of stable production.
- Database: drop confirmed-unused tables in a final reversible migration (separately reviewed).

**Phase 9 (future) — Client portal + Cloneable SaaS.**
- `/client/*` routes with limited RLS.
- Multi-tenant: introduce `practitioner_id` everywhere now (in Phase 2) so cloning to other coaches is just adding accounts.

## 9. Risk Assessment

- **Breaking current app**: Mind-OS chrome is deeply wired (`ProtectedAppShellV2`, AION orb, world stage, contexts). Risk of regression if shell stripped too fast. Mitigation: feature-flag + parallel `XSystemShell` instead of editing `ProtectedAppShellV2`.
- **Deleting useful code**: `audit-deadcode.mjs` already produced false positives (e.g. `admin/Leads.tsx` flagged orphan but live). Mitigation: never delete in Phase 1; quarantine only.
- **Database / auth**: ~190 tables, dense RLS, custom Web3Auth path. Risk: migrations that touch shared tables. Mitigation: additive migrations only, never `DROP` in early phases.
- **Privacy of client data**: session notes / beliefs / parts are highly sensitive PHI-like data. Mitigation: RLS scoped to `practitioner_id`; service-role only edge functions; encrypted columns for free-text where feasible; explicit consent capture on `clients.consent`; document retention.
- **Over-build**: Mind-OS habit of adding AI everywhere. Mitigation: ship CRUD + assignments first, add AI drafting in Phase 5+ only after manual flow is real.
- **Brand drift**: existing `mem://` rules still reference "Game of Your Life", "Mind OS". Mitigation: update memory Core in Phase 1.
- **Unclear architecture**: 60+ pages, ~742 components, 90 functions, multiple shells (Hallway, ShellV2, SelfWorld, Worlds). Mitigation: declare `XSystemShell` as the single XSYSTEM shell; others quarantined.
- **Secrets**: WhatsApp/Instagram/ManyChat API keys must go through `secrets--add_secret`, not env files.
- **Billing coupling**: Stripe webhooks reference Mind-OS tiers/products. Don't remove tiers until Phase 8; keep webhook idempotent.

## 10. First Implementation Recommendation (highest value / lowest risk)

**Ship the Leads → Clients converter, additive only.**

Single small step:
1. Add migration: `clients`, `client_profiles` tables (RLS + GRANTs) — no other tables yet.
2. Add a "Convert to client" button in the existing `LeadsCRM` lead drawer that creates a `clients` row and links `lead_id`.
3. Add `/app/clients` list page + `/app/clients/:id` shell with a single "Overview" tab pulling lead+client data.

Why it's the right first step:
- Zero impact on Mind-OS surface — purely new routes + two new tables.
- Uses the most mature, already-live area (Leads CRM, intake chat, lead activity).
- Immediately produces a "client" object the rest of XSYSTEM hangs off, so every later phase can start filling tabs without re-architecture.
- Reversible: drop the two tables and remove three files if you change direction.

---

### Open questions before Phase 2 (ask once plan is approved)

- Confirm: single-practitioner-only for v1, or design multi-tenant from day one? (Affects whether every table carries `practitioner_id` immediately.)
- Confirm the Rooms catalog (names + order) so it can be seeded in Phase 2.
- Confirm channels for inbound check-ins (WhatsApp inbound webhook? IG DM via ManyChat? Email reply?).
- Keep or remove public marketing surfaces (`/founding`, `/blog`, `/courses`, `/subscriptions`) for XSYSTEM launch?
