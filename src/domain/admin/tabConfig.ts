/**
 * @module domain/admin/tabConfig
 * @purpose Centralised tab + sub-tab configuration for AdminHub.
 *
 * Exire Systema admin IA (Phase IA-6 — Touch-First OS).
 * Five visible top-level groups: היום / לידים / מתאמנים / סטודיו / עוד.
 * Studio + More are card-launcher screens. Legacy stays mounted under ארכיון.
 */

import { lazy } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Wand2,
  MoreHorizontal,
  Archive,
} from 'lucide-react';
import type { AdminTabConfig } from './types';

// ─── Primary ────────────────────────────────────────────────────────────────
const ExireDashboard       = lazy(() => import('@/components/careers/coach/ExireDashboard'));
const XSystemClientsTab    = lazy(() => import('@/components/admin/clients/XSystemClientsTab'));
const Leads                = lazy(() => import('@/pages/admin/Leads'));

// ─── Studio (Creation / setup workspace) ────────────────────────────────────
const StudioHome           = lazy(() => import('@/components/admin/launchers/StudioHome'));
const ExireFunnelSettings  = lazy(() => import('@/pages/admin/ExireFunnelSettings'));
const LandingPages         = lazy(() => import('@/pages/admin/LandingPages'));
const LandingPageBuilder   = lazy(() => import('@/pages/admin/LandingPageBuilder'));
const Forms                = lazy(() => import('@/pages/admin/Forms'));
const ExireLeadForms       = lazy(() => import('@/pages/admin/ExireLeadForms'));
const MessageTemplates     = lazy(() => import('@/pages/admin/MessageTemplates'));
const Recordings           = lazy(() => import('@/pages/admin/Recordings'));
const Videos               = lazy(() => import('@/pages/admin/Videos'));
const AdminBlog            = lazy(() => import('@/pages/admin/Blog'));
const FAQs                 = lazy(() => import('@/pages/admin/FAQs'));
const Testimonials         = lazy(() => import('@/pages/admin/Testimonials'));
const AdminOffers          = lazy(() => import('@/pages/admin/Offers'));

// ─── More (System / management) ─────────────────────────────────────────────
const MoreHome             = lazy(() => import('@/components/admin/launchers/MoreHome'));
const Analytics            = lazy(() => import('@/pages/admin/Analytics'));
const AuroraInsights       = lazy(() => import('@/pages/admin/AuroraInsights'));
const AdminSettings        = lazy(() => import('@/pages/admin/Settings'));
const UsersPage            = lazy(() => import('@/pages/admin/Users'));
const Integrations         = lazy(() => import('@/pages/admin/Integrations'));
const NotificationCenter   = lazy(() => import('@/pages/admin/NotificationCenter'));
const AdminTheme           = lazy(() => import('@/pages/admin/Theme'));
const Newsletter           = lazy(() => import('@/pages/admin/Newsletter'));
const AdminAffiliates      = lazy(() => import('@/pages/admin/Affiliates'));
const BugReports           = lazy(() => import('@/pages/admin/BugReports'));

// ─── Legacy (still mounted, deprioritised) ──────────────────────────────────
const CoachDashboardOverview = lazy(() => import('@/components/careers/coach/CoachDashboardOverview'));
const CoachLeadsTab          = lazy(() => import('@/components/careers/coach/CoachLeadsTab'));
const CoachClientsTab        = lazy(() => import('@/components/careers/coach/CoachClientsTab'));
const CoachPlansTab          = lazy(() => import('@/components/careers/coach/CoachPlansTab'));
const CoachContentTab        = lazy(() => import('@/components/careers/coach/CoachContentTab'));
const CoachMarketingTab      = lazy(() => import('@/components/careers/coach/CoachMarketingTab'));
const CoachAnalyticsTab      = lazy(() => import('@/components/careers/coach/CoachAnalyticsTab'));
const CoachSettingsTab       = lazy(() => import('@/components/careers/coach/CoachSettingsTab'));
const CoachLandingPagesTab   = lazy(() => import('@/components/careers/coach/CoachLandingPagesTab'));
const CoachProductsTab       = lazy(() => import('@/components/careers/coach/CoachProductsTab'));
const CoachPricingPage       = lazy(() => import('@/components/careers/coach/CoachPricingPage'));
const AdminProducts          = lazy(() => import('@/pages/admin/Products'));
const Purchases              = lazy(() => import('@/pages/admin/Purchases'));
const Content                = lazy(() => import('@/pages/admin/Content'));
const HomepageSections       = lazy(() => import('@/pages/admin/HomepageSections'));
const Businesses             = lazy(() => import('@/pages/admin/Businesses'));
const CareerApplications     = lazy(() => import('@/pages/admin/CareerApplications'));
const Coaches                = lazy(() => import('@/pages/admin/Coaches'));
const ChatAssistant          = lazy(() => import('@/pages/admin/ChatAssistant'));
const FMBounties             = lazy(() => import('@/pages/admin/FMBounties'));
const WorkMonitor            = lazy(() => import('@/pages/admin/WorkMonitor'));
const Menu                   = lazy(() => import('@/pages/admin/Menu'));

// ─── Tab Configuration ──────────────────────────────────────────────────────

export const ADMIN_TABS: AdminTabConfig[] = [
  {
    id: 'today',
    labelHe: 'היום',
    labelEn: 'Today',
    icon: LayoutDashboard,
    subTabs: [
      { id: 'exire-today', labelHe: 'Exire היום', labelEn: 'Exire Today', component: ExireDashboard },
    ],
  },
  {
    id: 'leads',
    labelHe: 'לידים',
    labelEn: 'Leads',
    icon: Users,
    subTabs: [
      { id: 'crm', labelHe: 'CRM', labelEn: 'CRM', component: Leads },
    ],
  },
  {
    id: 'clients',
    labelHe: 'מתאמנים',
    labelEn: 'Clients',
    icon: UserCheck,
    subTabs: [
      { id: 'xsystem-clients', labelHe: 'מתאמנים', labelEn: 'Clients', component: XSystemClientsTab },
    ],
  },
  {
    id: 'studio',
    labelHe: 'סטודיו',
    labelEn: 'Studio',
    icon: Wand2,
    subTabs: [
      { id: 'studio-home',      labelHe: 'סטודיו',          labelEn: 'Studio',           component: StudioHome },
      { id: 'exire-funnel',     labelHe: 'דף נחיתה',        labelEn: 'Funnel Settings',  component: ExireFunnelSettings },
      { id: 'landing-pages',    labelHe: 'דפי נחיתה',       labelEn: 'Landing Pages',    component: LandingPages },
      { id: 'landing-builder',  labelHe: 'בונה דפי נחיתה',  labelEn: 'Page Builder',     component: LandingPageBuilder },
      { id: 'forms',            labelHe: 'טפסים',           labelEn: 'Forms',            component: Forms },
      { id: 'exire-lead-forms', labelHe: 'מיפוי לידים',     labelEn: 'Lead Mapping',     component: ExireLeadForms },
      { id: 'templates',        labelHe: 'תבניות הודעה',    labelEn: 'Templates',        component: MessageTemplates },
      { id: 'recordings',       labelHe: 'הקלטות',          labelEn: 'Recordings',       component: Recordings },
      { id: 'videos',           labelHe: 'סרטונים',         labelEn: 'Videos',           component: Videos },
      { id: 'blog',             labelHe: 'בלוג',            labelEn: 'Blog',             component: AdminBlog },
      { id: 'faqs',             labelHe: 'שאלות נפוצות',    labelEn: 'FAQs',             component: FAQs },
      { id: 'testimonials',     labelHe: 'המלצות',          labelEn: 'Testimonials',     component: Testimonials },
      { id: 'offers',           labelHe: 'הצעות',           labelEn: 'Offers',           component: AdminOffers },
    ],
  },
  {
    id: 'more',
    labelHe: 'עוד',
    labelEn: 'More',
    icon: MoreHorizontal,
    subTabs: [
      { id: 'more-home',       labelHe: 'עוד',           labelEn: 'More',           component: MoreHome },
      { id: 'analytics',       labelHe: 'אנליטיקס',      labelEn: 'Analytics',      component: Analytics },
      { id: 'aurora-insights', labelHe: 'תובנות Aurora', labelEn: 'Insights',       component: AuroraInsights },
      { id: 'settings',        labelHe: 'הגדרות',        labelEn: 'Settings',       component: AdminSettings },
      { id: 'users',           labelHe: 'משתמשים',       labelEn: 'Users',          component: UsersPage },
      { id: 'integrations',    labelHe: 'אינטגרציות',    labelEn: 'Integrations',   component: Integrations },
      { id: 'notifications',   labelHe: 'התראות',        labelEn: 'Notifications',  component: NotificationCenter },
      { id: 'theme',           labelHe: 'ערכת נושא',     labelEn: 'Theme',          component: AdminTheme },
      { id: 'newsletter',      labelHe: 'ניוזלטר',       labelEn: 'Newsletter',     component: Newsletter },
      { id: 'affiliates',      labelHe: 'שותפים',        labelEn: 'Affiliates',     component: AdminAffiliates },
      { id: 'bug-reports',     labelHe: 'דיווחי באגים',  labelEn: 'Bug Reports',    component: BugReports },
    ],
  },
  {
    id: 'legacy',
    labelHe: 'ארכיון',
    labelEn: 'Archive',
    icon: Archive,
    hidden: true,
    subTabs: [
      { id: 'coach-overview',       labelHe: 'סקירת מאמן',         labelEn: 'Coach Overview',     component: CoachDashboardOverview },
      { id: 'coach-leads',          labelHe: 'לידים (ישן)',        labelEn: 'Coach Leads',        component: CoachLeadsTab },
      { id: 'coach-clients',        labelHe: 'מתאמנים (ישן)',     labelEn: 'Coach Clients',      component: CoachClientsTab },
      { id: 'coach-plans',          labelHe: 'תוכניות',            labelEn: 'Plans',              component: CoachPlansTab },
      { id: 'coach-content',        labelHe: 'תוכן',               labelEn: 'Content',            component: CoachContentTab },
      { id: 'coach-marketing',      labelHe: 'שיווק',              labelEn: 'Marketing',          component: CoachMarketingTab },
      { id: 'coach-analytics',      labelHe: 'אנליטיקס מאמן',      labelEn: 'Coach Analytics',    component: CoachAnalyticsTab },
      { id: 'coach-settings',       labelHe: 'הגדרות מאמן',        labelEn: 'Coach Settings',     component: CoachSettingsTab },
      { id: 'coach-landing-pages',  labelHe: 'דפי נחיתה (ישן)',    labelEn: 'Coach Landing',      component: CoachLandingPagesTab },
      { id: 'coach-products',       labelHe: 'מוצרים (ישן)',       labelEn: 'Coach Products',     component: CoachProductsTab },
      { id: 'coach-pricing',        labelHe: 'תמחור',              labelEn: 'Pricing',            component: CoachPricingPage },
      { id: 'admin-products',       labelHe: 'מוצרים',             labelEn: 'Products',           component: AdminProducts },
      { id: 'purchases',            labelHe: 'רכישות',             labelEn: 'Purchases',          component: Purchases },
      { id: 'content',              labelHe: 'תוכן ציבורי',        labelEn: 'Public Content',     component: Content },
      { id: 'homepage-sections',    labelHe: 'מקטעי דף בית',       labelEn: 'Homepage Sections',  component: HomepageSections },
      { id: 'businesses',           labelHe: 'עסקים',              labelEn: 'Businesses',         component: Businesses },
      { id: 'career-applications',  labelHe: 'מועמדויות קריירה',   labelEn: 'Career Applications', component: CareerApplications },
      { id: 'coaches',              labelHe: 'מאמנים',             labelEn: 'Coaches',            component: Coaches },
      { id: 'chat-assistant',       labelHe: 'עוזר צ׳אט',          labelEn: 'Chat Assistant',     component: ChatAssistant },
      { id: 'fm-bounties',          labelHe: 'FM Bounties',        labelEn: 'FM Bounties',        component: FMBounties },
      { id: 'work-monitor',         labelHe: 'מעקב עבודה',         labelEn: 'Work Monitor',       component: WorkMonitor },
      { id: 'menu',                 labelHe: 'תפריט',              labelEn: 'Menu',               component: Menu },
    ],
  },
];
