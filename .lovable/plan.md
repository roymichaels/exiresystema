## Problem

There are two parallel CRM systems that don't talk to each other:

| Surface | Reads from | Rows today |
|---|---|---|
| `/admin/leads` (`src/pages/admin/Leads.tsx`) | `public.leads` + `public.exit_intent_leads` | 4 |
| `CoachHub` → "leads" tab (`CoachLeadsTab`) | `public.coach_leads` filtered by practitioner_id | 0 |

Intake chat (`save_lead` tool) writes only to `public.leads`. Coach landing pages write to `coach_leads`. Because no `practitioners` row exists for the founder, the coach tab is permanently empty. Result: real leads (e.g. דין, שחר, דוד) sit in admin only, never surface in the coach view, and the founder has to bounce between two screens.

The founder is solo — "admin is the coach". One inbox, one CRM.

## Goal

A single CRM, single SSOT, mounted in both the admin shell and the coach shell, that ingests every lead source: intake chat, exit-intent popup, coach landing-page forms, and manual entries.

## Approach

### 1. Pick `public.leads` as the SSOT

It already has the richest schema: `pain_category`, `pain_duration`, `prior_attempts`, `desired_outcome`, `transformation_vision`, `readiness_score`, `intent`, `ai_analysis`, `conversation`, `affiliate_code`. `coach_leads` and `exit_intent_leads` are subsets of it.

### 2. Migration (one transaction)

- Add columns to `public.leads`:
  - `tags text[]`
  - `landing_page_id uuid references public.coach_landing_pages(id) on delete set null`
  - `metadata jsonb not null default '{}'`
  - `updated_at timestamptz not null default now()` + trigger
- Extend allowed `source` values to include `landing_page`, `exit_intent`, `manual`.
- Allow `phone` to be nullable (exit-intent and landing-page leads may have only email). Add a CHECK that `phone IS NOT NULL OR email IS NOT NULL`.
- Backfill:
  - Copy every `coach_leads` row → `leads` with `source='landing_page'`, preserving `landing_page_id`, `tags`, `metadata`, `notes`, `status` (map `qualified`→`scheduled`).
  - Copy every `exit_intent_leads` row → `leads` with `source='exit_intent'`, `status` from `is_contacted`.
- Refresh RLS on `leads`:
  - `admin` and any user with `coach` role → full SELECT/UPDATE/DELETE.
  - Anon/authenticated → INSERT only (unchanged).
- Keep `coach_leads` and `exit_intent_leads` tables in place but stop writing to them; mark for later removal (note in plan, not deleted now to avoid breaking any leftover edge function).

### 3. New unified `LeadsCRM` component

Create `src/components/crm/LeadsCRM.tsx` + small subcomponents:

- `LeadsStatsBar` — totals by status + by source.
- `LeadsFilters` — search, source filter (intake_chat / landing_page / exit_intent / manual / affiliate), status filter, date range.
- `LeadsTable` — sortable rows with name, phone/email, source, status pill, created_at, quick actions (call, WhatsApp, change status, delete).
- `LeadDetailDrawer` — opens on row click; shows:
  - Contact block (name, phone with tel:, email with mailto:, WhatsApp deep-link using existing `buildWhatsappUrl` helper).
  - Intake snapshot: pain_category / duration / prior_attempts / vision / readiness_score / intent.
  - AI analysis pretty-printed (pattern_diagnosis, emotional_intensity, change_depth, etc).
  - Full transcript from `conversation` (reuse the existing `LandingChatTranscripts` rendering style).
  - Notes textarea + status select + tags input.
- `AddLeadDialog` — manual entry (source='manual').

Data layer: one hook file `src/hooks/useLeads.ts` with `useLeads`, `useLeadStats`, `useUpdateLead`, `useDeleteLead`, `useAddLead` — all hitting `public.leads`.

### 4. Mount in both shells

- `src/pages/admin/Leads.tsx` → replace body with `<LeadsCRM scope="admin" />`. Keep the "תמלילי שיחות" tab (`LandingChatTranscripts`) as a secondary tab.
- `src/components/careers/coach/CoachLeadsTab.tsx` → replace body with `<LeadsCRM scope="coach" />`. The `scope` prop only changes labels/empty-state copy; data is the same.
- Remove the practitioner-id gate from the coach tab.

### 5. Redirect remaining writers

- Coach landing-page form: change its insert target from `coach_leads` to `leads` (`source='landing_page'`, set `landing_page_id`). Search the codebase for `from('coach_leads').insert` and switch.
- Exit-intent popup: change insert from `exit_intent_leads` to `leads` (`source='exit_intent'`, email-only).
- Intake chat edge function (`supabase/functions/intake-chat`): already writes to `leads` — leave as is.

### 6. Sidebar badge

`['admin-new-leads']` query already exists. Point it at `leads` where `status='new'` regardless of source so the badge reflects everything (not only intake_chat).

## Out of scope

- Multi-tenant practitioner separation (founder is solo; revisit if/when a real coach is added — `practitioner_id` column can be added then).
- Deleting the old `coach_leads` / `exit_intent_leads` tables. Left in place this round; can be dropped in a follow-up after a week of verified writes to `leads`.
- New email/SMS notifications — existing `notifyFounder` flow stays untouched.

## Open question

None blocking — proceeding on the assumption that all four data sources (intake, exit, landing, manual) belong in one inbox, with `source` as the discriminator and per-source filter chips. If you'd rather keep landing-page leads in a visually separate section inside the same CRM, say so and I'll add a top-level "Source" tab strip instead of just a filter.