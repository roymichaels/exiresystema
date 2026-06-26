
# Exire Systema — Admin Panel Audit & Consolidation Plan

Audit only. No files will be changed, no routes removed, no data deleted. All findings reference real files in `src/domain/admin/tabConfig.ts`, `src/pages/admin/*`, `src/components/admin/*`, `src/components/careers/coach/*`, `src/components/crm/*`.

---

## 1. Current Admin Map

Source of truth: `src/domain/admin/tabConfig.ts` (4 top tabs, 33 sub-tabs).

### Tab: Coach (`coach`)
| Sub-tab | Key | Component | Purpose | Classification |
|---|---|---|---|---|
| Exire Today | `exire-today` | `careers/coach/ExireDashboard.tsx` | Daily ops dashboard (revenue, tasks, leads, launch checklist) | **Exire-critical** |
| XSYSTEM Clients | `xsystem-clients` | `admin/clients/XSystemClientsTab.tsx` → `ClientDetail.tsx` | Coaching client workspace (sessions, beliefs, parts, payments…) | **Exire-critical** |
| Leads | `leads` | `careers/coach/CoachLeadsTab.tsx` | Coach-scoped leads view | **Duplicate** of CRM |
| Exire Lead Forms | `exire-lead-forms` | `pages/admin/ExireLeadForms.tsx` | Maps form submissions → CRM leads | **Exire-critical** |
| Funnel Settings | `exire-funnel` | `pages/admin/ExireFunnelSettings.tsx` | Landing VSL/WhatsApp/CTA/intake form | **Exire-critical** |
| Templates | `templates` | `pages/admin/MessageTemplates.tsx` | WhatsApp/message templates | **Exire-critical** |
| Forms | `forms` | `pages/admin/Forms.tsx` | Form builder + AI wizard | **Exire-critical** (also mounted under Content) |
| Recordings | `recordings` | `pages/admin/Recordings.tsx` | Audio library + mp4→mp3 | **Exire-critical** (also under Content) |
| Analytics | `analytics` | `pages/admin/Analytics.tsx` | Generic analytics | Useful |
| Plans (legacy) | `plans` | `CoachPlansTab.tsx` | Old plans | **Legacy** |
| Overview (legacy) | `overview` | `CoachDashboardOverview.tsx` | Old coach dashboard | **Legacy** |
| Clients (legacy) | `clients` | `CoachClientsTab.tsx` | Old client list | **Legacy / Duplicate** of XSYSTEM |

### Tab: Marketing (`marketing`)
| Sub-tab | File | Status |
|---|---|---|
| Landing Pages | `LandingPages.tsx` | Useful (separate from Exire `/` funnel) |
| Homepage | `HomepageSections.tsx` | **Overlaps Funnel Settings** (since `/` = ExireLanding) |
| Offers | `Offers.tsx` | Useful |
| Affiliates | `Affiliates.tsx` | Useful |
| Newsletter | `Newsletter.tsx` | Useful |
| Theme | `Theme.tsx` | Settings-shaped, misplaced |
| FAQs | `FAQs.tsx` | Useful (landing content) |
| Testimonials | `Testimonials.tsx` | Useful (landing content) |

### Tab: Content (`content`)
| Sub-tab | File | Status |
|---|---|---|
| Products | `Products.tsx` | Legacy marketplace |
| Purchases | `Purchases.tsx` | **Overlaps Exire Payments** (inside ClientDetail) |
| Blog | `Blog.tsx` | Useful |
| Content | `Content.tsx` | Generic CMS — overlaps Homepage/Landing |
| Videos | `Videos.tsx` | Useful (separate from Recordings) |
| Recordings | `recordings` | **Duplicate mount** of Coach > Recordings |
| Forms | `forms` | **Duplicate mount** of Coach > Forms |

### Tab: System (`system`)
| Sub-tab | File | Status |
|---|---|---|
| Integrations | `Integrations.tsx` | Keep |
| Notifications | `NotificationCenter.tsx` | Keep |
| Users | `Users.tsx` | Keep |
| Bug Reports | `BugReports.tsx` | Keep |
| Settings | `Settings.tsx` | Keep |

### Orphan admin pages (exist on disk, not in tabConfig)
`AuroraInsights`, `Businesses`, `CareerApplications`, `ChatAssistant`, `Coaches`, `FMBounties`, `LandingPageBuilder`, `Menu`, `WorkMonitor`, `Leads.tsx` (the CRM+transcripts page using `components/crm/LeadsCRM`).

Notably `pages/admin/Leads.tsx` (CRM + transcripts) is **not** referenced by the tab config — the visible "Leads" tab uses `CoachLeadsTab` instead. This is the single biggest CRM duplication.

---

## 2. Redundancy Report

| Area | Primary (keep) | Duplicates / overlaps | Recommendation |
|---|---|---|---|
| Leads / CRM | `components/crm/LeadsCRM.tsx` (rich CRM, used by `pages/admin/Leads.tsx`) | `CoachLeadsTab` (the currently-visible "Leads" sub-tab) | Swap visible sub-tab to render `LeadsCRM`; hide `CoachLeadsTab` under Legacy |
| Clients | `XSystemClientsTab` + `ClientDetail` | `CoachClientsTab`, `ClientProfilePanel` (older) | Keep XSYSTEM as the only "Clients" entry; move legacy under Legacy |
| Forms | `pages/admin/Forms.tsx` (with AI wizard) | Same component mounted twice (Coach + Content) | Mount once under new "Forms" group |
| Lead-form mapping | `ExireLeadForms.tsx` | Conceptually overlaps with Forms | Keep as sibling under "Forms" group ("Mappings") |
| Funnel settings | `ExireFunnelSettings.tsx` | `HomepageSections.tsx`, `Content.tsx` (since `/` is ExireLanding) | Make Funnel the primary; HomepageSections labelled "Legacy Homepage" |
| Recordings | `pages/admin/Recordings.tsx` | Mounted twice; also overlaps "Audio Assignments" inside ClientDetail | Keep one mount under Assets; ClientDetail keeps its assignment UI (different scope) |
| Payments | ClientDetail > Payments tab | `Purchases.tsx` | Keep Purchases under Legacy until Exire payments fully replaces it |
| Coach* tabs | — | `CoachContentTab`, `CoachMarketingTab`, `CoachAnalyticsTab`, `CoachSettingsTab`, `CoachLandingPagesTab`, `CoachProductsTab`, `CoachPricingPage`, `CoachesLanding`, `CoachHudSidebar` | All Legacy in admin nav (do not delete) |
| Today vs Analytics | `ExireDashboard` | `Analytics.tsx`, `AuroraInsights.tsx` | Today stays primary; Analytics goes under Analytics group |

---

## 3. Proposed New Admin IA

8 visible groups + Legacy. Every existing component stays mounted — only the tab graph changes.

```
A. היום (Today)            → ExireDashboard
B. לידים (Sales / CRM)
     ├─ CRM                → LeadsCRM (was hidden in pages/admin/Leads.tsx)
     ├─ תמלילי שיחות       → LandingChatTranscripts
     ├─ טפסי לידים          → ExireLeadForms (mapping)
     └─ מדדי פאנל          → Analytics (funnel view)
C. מתאמנים (Clients)
     ├─ רשימה              → XSystemClientsTab
     └─ פרופיל              → ClientDetail (drill-in)
D. דף נחיתה (Funnel)
     ├─ הגדרות             → ExireFunnelSettings
     ├─ דפי נחיתה נוספים    → LandingPages
     └─ Builder            → LandingPageBuilder
E. טפסים (Forms)
     ├─ בונה טפסים          → Forms
     ├─ מיפוי ל-CRM        → ExireLeadForms
     └─ הגשות              → (Forms internal)
F. נכסים (Assets / Content)
     ├─ הקלטות             → Recordings
     ├─ סרטונים            → Videos
     ├─ תבניות הודעה       → MessageTemplates
     ├─ בלוג               → Blog
     ├─ FAQ                → FAQs
     ├─ המלצות             → Testimonials
     └─ הצעות              → Offers
G. אנליטיקס (Analytics)
     ├─ סקירה              → Analytics
     └─ Aurora             → AuroraInsights
H. הגדרות (Settings)
     ├─ אינטגרציות         → Integrations
     ├─ התראות             → NotificationCenter
     ├─ ערכת נושא          → Theme
     ├─ ניוזלטר            → Newsletter
     ├─ שותפים             → Affiliates
     ├─ משתמשים            → Users
     ├─ באגים              → BugReports
     └─ כללי               → Settings
I. ארכיון (Legacy — collapsed, off main bar)
     CoachLeadsTab, CoachClientsTab, CoachPlansTab, CoachDashboardOverview,
     CoachContentTab, CoachMarketingTab, CoachAnalyticsTab, CoachSettingsTab,
     CoachLandingPagesTab, CoachProductsTab, CoachPricingPage, Products,
     Purchases, Content (CMS), HomepageSections, Businesses, CareerApplications,
     Coaches, ChatAssistant, FMBounties, WorkMonitor, Menu
```

Drops top tabs from 4 noisy buckets (Coach/Marketing/Content/System) to 8 named-by-purpose groups; lowers max visible chip count and matches the user's spec exactly.

---

## 4. Mobile UX Issues (per page)

Driven by `AdminInlineNav` (two horizontal scroll rows), `AdminStatsBar` (large card grid), `AdminHub` paddings.

| Page | Problem | Fix direction |
|---|---|---|
| `AdminInlineNav` | 4 primary chips + up to 12 sub-chips, both horizontally scrolling | Convert to: bottom drawer "section switcher" + sticky bottom nav of 5 groups (Today/Leads/Clients/Funnel/More) |
| `AdminStatsBar` | Wide multi-card row; wraps awkwardly | 2-col grid on `sm`, single horizontal swipe carousel only above `md` |
| `ExireDashboard` | Many KPI cards + tasks + checklist on one screen | Collapse into sections: KPI (1 hero card + collapsible grid), Tasks (list), Checklist (collapsible) |
| `LeadsCRM` / `CoachLeadsTab` | Lead rows show too many badges; actions inline | New mobile lead card (see §6) with one primary + kebab |
| `XSystemClientsTab` | Client cards bulky, status/notes cramped | Avatar+name+next-action card; details on tap → bottom sheet |
| `ClientDetail` | 12-tab horizontal strip | Replace with bottom-sheet section picker + breadcrumbed deep-link |
| `ExireFunnelSettings` | Long form, video upload + preview + checklist all stacked | Split into accordion sections (Video / WhatsApp / CTA / Intake / Checklist) |
| `Forms` | Builder cramped, AI button competes with list | Sticky FAB for "צור עם AI"; list rows simpler (title + 1 meta + chevron) |
| `Recordings` | Video card grid w/ multiple buttons | 1 thumbnail + 1 title + kebab (Convert / Download / Edit / Delete) |
| `MessageTemplates` | Long preview text in card | Title + first 40 chars + send-test FAB |
| `ExireLeadForms` | Mapping UI is table-shaped | Card per form with field-mapping bottom sheet |
| Safe-area | `AdminHub` already pads top/bottom, but stats bar pushes content below fold | Hide stats bar by default on mobile; reveal via pull-down |

---

## 5. Mobile App Shell — Recommended Pattern

```
┌─────────────────────────────────────┐
│  Top bar: section title + ⋯ menu    │ ← swaps per group
├─────────────────────────────────────┤
│                                     │
│  Page content (single column)       │
│  Sticky primary action (FAB or bar) │
│                                     │
├─────────────────────────────────────┤
│  Bottom nav: Today · Leads · Clients · Funnel · More │
└─────────────────────────────────────┘
```

"More" opens a bottom sheet listing Funnel/Forms/Assets/Analytics/Settings/Legacy. Sub-tabs become a horizontal segmented control **only when ≤4**, otherwise a dropdown.

---

## 6. Mobile Card Patterns

**Lead card (LeadsCRM redesign)**
```
┌──────────────────────────────────────────┐
│  שם הליד                  [מקור] [סטטוס]  │
│  ★ ציון 78                                │
│  אתגר עיקרי: …תצוגה מקדימה קצרה…          │
│  פעולה הבאה: התקשרות מחר                  │
│  [שלח הודעה  ▸]                    [ ⋯ ] │
└──────────────────────────────────────────┘
   ⋯ menu: Call · WhatsApp template · Follow-up · Convert · View answers
```

**Client card (XSystemClientsTab)**
```
┌──────────────────────────────────────────┐
│  Avatar  שם המתאמן       [שלב התהליך]    │
│  סשן אחרון: לפני 3 ימים                  │
│  משימה פתוחה: שליחת הקלטה                 │
│  [פתח פרופיל ▸]                    [ ⋯ ] │
└──────────────────────────────────────────┘
```

**Dashboard hero card** — single revenue + delta number, then collapsible KPI grid.

**Empty states** — illustration + 1 sentence + 1 primary CTA, no secondary noise.

---

## 7. Naming Cleanup Map

| Old EN | Old HE | New EN | New HE |
|---|---|---|---|
| Exire Today | Exire היום | Today | היום |
| XSYSTEM Clients | לקוחות XSYSTEM | Clients | מתאמנים |
| Leads | לידים | Leads | לידים |
| Exire Lead Forms | טפסי לידים Exire | Form → Lead Mapping | מיפוי טפסים |
| Funnel Settings | הגדרות פאנל | Landing Settings | הגדרות דף נחיתה |
| Forms | טפסים | Forms | טפסים |
| Recordings | הקלטות | Recordings | הקלטות |
| Message Templates | תבניות הודעות | Templates | תבניות הודעה |
| Plans (legacy) | תוכניות (legacy) | — | — (under Legacy) |
| Coach | מאמן | (removed top-tab) | — |

---

## 8. Exire-critical vs Legacy Table

| Decision | Items |
|---|---|
| **Keep visible (primary)** | ExireDashboard, XSystemClientsTab, ClientDetail, LeadsCRM, ExireLeadForms, ExireFunnelSettings, Forms, Recordings, Videos, MessageTemplates, Analytics, Integrations, Settings, Users, NotificationCenter |
| **Move under "More"** | Theme, Newsletter, Affiliates, Offers, FAQs, Testimonials, Blog, LandingPages, LandingPageBuilder, AuroraInsights, BugReports |
| **Move under "Legacy"** | CoachLeadsTab, CoachClientsTab, CoachPlansTab, CoachDashboardOverview, CoachContentTab, CoachMarketingTab, CoachAnalyticsTab, CoachSettingsTab, CoachLandingPagesTab, CoachProductsTab, CoachPricingPage, Products, Purchases, Content (CMS), HomepageSections, Businesses, CareerApplications, Coaches, ChatAssistant, FMBounties, WorkMonitor, Menu |
| **Keep but rename** | "XSYSTEM Clients" → "מתאמנים"; "Funnel Settings" → "הגדרות דף נחיתה"; "Exire Today" → "היום" |
| **Merge visually** | Forms + ExireLeadForms into a "Forms" group; ExireFunnelSettings + LandingPages into a "Funnel" group |
| **Never delete / do not touch** | AION, Aurora, Worlds, FM, gamification, courses, marketplace logic, all public funnel routes (`/`, `/exire`, `/form/:token`), edge functions |

---

## 9. Safe Phased Implementation Plan

### Phase A — Navigation cleanup (low risk)
- Files: `src/domain/admin/tabConfig.ts` only.
- Reorder + rename + regroup into the 8-group IA. Move duplicates/legacy under an `id: 'legacy'` tab. Replace visible "Leads" sub-tab to render `LeadsCRM` instead of `CoachLeadsTab` (mount `CoachLeadsTab` under Legacy).
- Result: same routes, same components, cleaner structure.
- Do not touch: any component file, any route in `App.tsx`, any edge function.

### Phase B — Mobile admin shell (medium risk)
- Files: `src/components/admin/AdminInlineNav.tsx`, `src/components/admin/AdminLayoutWrapper.tsx`, new `AdminMobileBottomNav.tsx`, new `AdminSectionSheet.tsx`.
- Add bottom-nav (5 groups) + "More" bottom sheet for ≥md hidden, mobile only. Desktop keeps current inline tabs.
- Hide `AdminStatsBar` by default on mobile (collapsible).
- Result: mobile admin feels app-like. Desktop unchanged.

### Phase C — Merge duplicate entry points (medium risk, visual only)
- Files: tabConfig already groups them in Phase A. Add light wrappers in `src/pages/admin/groups/` (FormsGroup, FunnelGroup) that render sub-segmented controls.
- No component logic changes.

### Phase D — Visual polish (medium risk, presentational)
- Redesign lead card (`LeadsCRM` row), client card (`XSystemClientsTab` row), dashboard KPI block (`ExireDashboard`), empty states.
- All changes confined to presentation; data hooks unchanged.

### Phase E — Optional deeper cleanup (high risk — gated on approval)
- Replace `ClientDetail` 12-tab strip with bottom-sheet section picker.
- Collapse stats cards into a single hero metric.
- Only after Phases A–D have shipped and been validated.

For every phase: **do not touch** `src/pages/ExireLanding.tsx`, `PublicForm.tsx`, edge functions, AION/Aurora/Worlds/FM directories, `App.tsx` routing, Supabase migrations.

---

## 10. Highest-Value First Implementation Prompt

> Execute Phase A only. Rewrite `src/domain/admin/tabConfig.ts` to expose 8 top tabs (`today`, `leads`, `clients`, `funnel`, `forms`, `assets`, `analytics`, `settings`) plus a final `legacy` tab. Map every component currently in the file to one of those groups per §3 of the audit. Replace the visible "Leads" sub-tab so it renders `LeadsCRM` (from `src/pages/admin/Leads.tsx`) instead of `CoachLeadsTab`; mount `CoachLeadsTab` under `legacy`. Apply Hebrew labels from the naming map (§7). Do not modify any other file. Do not change routes in `App.tsx`. Do not delete components. Verify the build is green and that every previously-mounted sub-tab is still reachable via the new structure.

---

**Assumptions I flagged rather than guessed**
- `pages/admin/Leads.tsx` (LeadsCRM + transcripts) appears unused by the tab config; I assumed this is unintentional and propose promoting it.
- `Purchases.tsx` overlaps `ClientDetail > Payments` — I assumed Payments is the forward-looking SSOT; Legacy classification is reversible.
- `Content.tsx` and `HomepageSections.tsx` are still useful for non-Exire surfaces; I marked them Legacy in *admin nav* only — components stay mounted.
