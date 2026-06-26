/**
 * @module domain/admin/tabConfig
 * @purpose Centralised tab + sub-tab configuration for AdminHub.
 *
 * Single-coach console (admin === sole coach). Collapsed from 7 tabs to 4:
 * Coach · Marketing · Content · System (with Integrations under System).
 */

import { lazy } from 'react';
import { Briefcase, Megaphone, FileText, Settings } from 'lucide-react';
import type { AdminTabConfig } from './types';

// ─── Coach (admin = sole coach) ─────────────────────────────────────────────
const CoachDashboardOverview = lazy(() => import('@/components/careers/coach/CoachDashboardOverview'));
const CoachClientsTab        = lazy(() => import('@/components/careers/coach/CoachClientsTab'));
const CoachLeadsTab          = lazy(() => import('@/components/careers/coach/CoachLeadsTab'));
const CoachPlansTab          = lazy(() => import('@/components/careers/coach/CoachPlansTab'));
const Analytics              = lazy(() => import('@/pages/admin/Analytics'));
const XSystemClientsTab      = lazy(() => import('@/components/admin/clients/XSystemClientsTab'));
const ExireDashboard         = lazy(() => import('@/components/careers/coach/ExireDashboard'));
const MessageTemplates       = lazy(() => import('@/pages/admin/MessageTemplates'));
const ExireFunnelSettings    = lazy(() => import('@/pages/admin/ExireFunnelSettings'));
const ExireLeadForms         = lazy(() => import('@/pages/admin/ExireLeadForms'));

// ─── Marketing (Campaigns + Site merged) ────────────────────────────────────
const AdminAffiliates   = lazy(() => import('@/pages/admin/Affiliates'));
const Newsletter        = lazy(() => import('@/pages/admin/Newsletter'));
const AdminOffers       = lazy(() => import('@/pages/admin/Offers'));
const LandingPages      = lazy(() => import('@/pages/admin/LandingPages'));
const HomepageSections  = lazy(() => import('@/pages/admin/HomepageSections'));
const AdminTheme        = lazy(() => import('@/pages/admin/Theme'));
const FAQs              = lazy(() => import('@/pages/admin/FAQs'));
const Testimonials      = lazy(() => import('@/pages/admin/Testimonials'));

// ─── Content ────────────────────────────────────────────────────────────────
const AdminProducts     = lazy(() => import('@/pages/admin/Products'));
const AdminBlog         = lazy(() => import('@/pages/admin/Blog'));
const Content           = lazy(() => import('@/pages/admin/Content'));
const Videos            = lazy(() => import('@/pages/admin/Videos'));
const Recordings        = lazy(() => import('@/pages/admin/Recordings'));
const Forms             = lazy(() => import('@/pages/admin/Forms'));
const Purchases         = lazy(() => import('@/pages/admin/Purchases'));

// ─── System ─────────────────────────────────────────────────────────────────
const Users             = lazy(() => import('@/pages/admin/Users'));
const NotificationCenter = lazy(() => import('@/pages/admin/NotificationCenter'));
const BugReports        = lazy(() => import('@/pages/admin/BugReports'));
const AdminSettings     = lazy(() => import('@/pages/admin/Settings'));
const Integrations      = lazy(() => import('@/pages/admin/Integrations'));

// ─── Tab Configuration ──────────────────────────────────────────────────────

export const ADMIN_TABS: AdminTabConfig[] = [
  {
    id: 'coach',
    labelHe: 'מאמן',
    labelEn: 'Coach',
    icon: Briefcase,
    subTabs: [
      // Exire Systema focus mode — primary workflow, ordered for daily use.
      { id: 'exire-today',     labelHe: 'Exire היום',      labelEn: 'Exire Today',      component: ExireDashboard },
      { id: 'xsystem-clients', labelHe: 'לקוחות XSYSTEM',  labelEn: 'XSYSTEM Clients',  component: XSystemClientsTab },
      { id: 'leads',           labelHe: 'לידים',           labelEn: 'Leads',            component: CoachLeadsTab },
      { id: 'exire-lead-forms', labelHe: 'טפסי לידים Exire', labelEn: 'Exire Lead Forms', component: ExireLeadForms },
      { id: 'exire-funnel',    labelHe: 'הגדרות פאנל',     labelEn: 'Funnel Settings',  component: ExireFunnelSettings },
      { id: 'templates',       labelHe: 'תבניות הודעות',   labelEn: 'Templates',        component: MessageTemplates },
      { id: 'forms',           labelHe: 'טפסים',           labelEn: 'Forms',            component: Forms },
      { id: 'recordings',      labelHe: 'הקלטות',          labelEn: 'Recordings',       component: Recordings },
      { id: 'analytics',       labelHe: 'אנליטיקס',        labelEn: 'Analytics',        component: Analytics },
      // Legacy / secondary — kept mounted, deprioritised in nav.
      { id: 'plans',           labelHe: 'תוכניות (legacy)', labelEn: 'Plans (legacy)',  component: CoachPlansTab },
      { id: 'overview',        labelHe: 'סקירה ישנה',      labelEn: 'Overview (legacy)', component: CoachDashboardOverview },
      { id: 'clients',         labelHe: 'מתאמנים (legacy)', labelEn: 'Clients (legacy)', component: CoachClientsTab },
    ],
  },
  {
    id: 'marketing',
    labelHe: 'שיווק',
    labelEn: 'Marketing',
    icon: Megaphone,
    subTabs: [
      { id: 'landing-pages', labelHe: 'דפי נחיתה', labelEn: 'Landing Pages', component: LandingPages },
      { id: 'homepage',      labelHe: 'עמוד הבית', labelEn: 'Homepage',      component: HomepageSections },
      { id: 'offers',        labelHe: 'הצעות',     labelEn: 'Offers',        component: AdminOffers },
      { id: 'affiliates',    labelHe: 'שותפים',    labelEn: 'Affiliates',    component: AdminAffiliates },
      { id: 'newsletter',    labelHe: 'ניוזלטר',   labelEn: 'Newsletter',    component: Newsletter },
      { id: 'theme',         labelHe: 'ערכת נושא', labelEn: 'Theme',         component: AdminTheme },
      { id: 'faqs',          labelHe: 'שאלות',     labelEn: 'FAQs',          component: FAQs },
      { id: 'testimonials',  labelHe: 'המלצות',    labelEn: 'Testimonials',  component: Testimonials },
    ],
  },
  {
    id: 'content',
    labelHe: 'תוכן',
    labelEn: 'Content',
    icon: FileText,
    subTabs: [
      { id: 'products',    labelHe: 'מוצרים',   labelEn: 'Products',   component: AdminProducts },
      { id: 'purchases',   labelHe: 'רכישות',   labelEn: 'Purchases',  component: Purchases },
      { id: 'blog',        labelHe: 'בלוג',     labelEn: 'Blog',       component: AdminBlog },
      { id: 'content-mgmt',labelHe: 'תוכן',     labelEn: 'Content',    component: Content },
      { id: 'videos',      labelHe: 'סרטונים',  labelEn: 'Videos',     component: Videos },
      { id: 'recordings',  labelHe: 'הקלטות',   labelEn: 'Recordings', component: Recordings },
      { id: 'forms',       labelHe: 'טפסים',    labelEn: 'Forms',      component: Forms },
    ],
  },
  {
    id: 'system',
    labelHe: 'מערכת',
    labelEn: 'System',
    icon: Settings,
    subTabs: [
      { id: 'integrations',  labelHe: 'אינטגרציות', labelEn: 'Integrations', component: Integrations },
      { id: 'notifications', labelHe: 'התראות',     labelEn: 'Notifications', component: NotificationCenter },
      { id: 'users',         labelHe: 'משתמשים',    labelEn: 'Users',        component: Users },
      { id: 'bug-reports',   labelHe: 'דיווחי באגים', labelEn: 'Bug Reports', component: BugReports },
      { id: 'settings',      labelHe: 'הגדרות',     labelEn: 'Settings',     component: AdminSettings },
    ],
  },
];
