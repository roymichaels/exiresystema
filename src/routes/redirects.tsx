/**
 * Centralized redirect map — keeps App.tsx lean.
 * Each entry: [fromPath, toPath].
 *
 * Rule: every entry must point at a CANONICAL destination
 * (one of: /, /aurora, /brain, /strategy, /outer-world, /coaches,
 * /creator, /freelancer, /admin-hub, /launchpad/complete, /journal).
 * Never chain through another redirect target like /mindos/* — those
 * legacy paths are themselves redirected and create double-hops.
 */
import { Route, Navigate } from 'react-router-dom';

/** Public-shell redirects (rendered above the protected outlet). */
const PUBLIC_REDIRECTS: [string, string][] = [
  ['/index', '/'],
  ['/home', '/'],
  ['/onboarding', '/'],
];

const SIMPLE_REDIRECTS: [string, string][] = [
  // Auth (modal-based now)
  ['/auth', '/'],
  ['/signup', '/'],
  ['/login', '/'],
  // Legacy products
  ['/personal-hypnosis', '/'],
  ['/consciousness-leap', '/'],
  ['/consciousness-leap/apply/:token', '/'],
  ['/form/:token', '/'],
  // Legacy onboarding — onboarding flow removed; route everything to Home (AION chat)
  ['/start', '/'],
  ['/free-journey', '/'],
  ['/free-journey/start', '/'],
  ['/free-journey/complete', '/launchpad/complete'],
  // Coach/practitioner aliases
  ['/practitioners', '/coaches'],
  ['/marketplace', '/coaches'],
  ['/affiliate-dashboard', '/affiliate'],
  // Legacy life-domain pages → Strategy missions (canonical)
  ['/combat-community', '/community'],
  ['/today', '/journey'],
  ['/projects', '/journey'],
  ['/consciousness', '/journey'],
  ['/health', '/journey'],
  ['/health/*', '/journey'],
  ['/relationships', '/journey'],
  ['/relationships/*', '/journey'],
  ['/finances', '/journey'],
  ['/finances/*', '/journey'],
  ['/learning', '/journey'],
  ['/learning/*', '/journey'],
  ['/purpose', '/journey'],
  ['/purpose/*', '/journey'],
  ['/hobbies', '/journey'],
  ['/hobbies/*', '/journey'],
  ['/messages/ai', '/home'],
  // Admin
  ['/admin', '/admin-hub'],
  ['/admin/*', '/admin-hub'],
  // Legacy panel → admin-hub
  ['/panel', '/admin-hub'],
  ['/panel/*', '/admin-hub'],
  // Coach
  ['/coach', '/coaches'],
  ['/coach/*', '/coaches'],
];

const PANEL_REDIRECTS: [string, string][] = [
  ['/panel/analytics', '/admin-hub?tab=overview&sub=analytics'],
  ['/panel/notifications', '/admin-hub?tab=overview&sub=notifications'],
  ['/panel/users', '/admin-hub?tab=admin&sub=users'],
  ['/panel/roles', '/admin-hub?tab=admin&sub=roles'],
  ['/panel/leads', '/admin-hub?tab=admin&sub=leads'],
  ['/panel/businesses', '/admin-hub?tab=admin&sub=businesses'],
  ['/panel/aurora-insights', '/admin-hub?tab=admin&sub=aurora-insights'],
  ['/panel/affiliates', '/admin-hub?tab=campaigns&sub=affiliates'],
  ['/panel/newsletter', '/admin-hub?tab=campaigns&sub=newsletter'],
  ['/panel/offers', '/admin-hub?tab=campaigns&sub=offers'],
  ['/panel/purchases', '/admin-hub?tab=campaigns&sub=purchases'],
  ['/panel/products', '/admin-hub?tab=content&sub=products'],
  ['/panel/content', '/admin-hub?tab=content&sub=content-mgmt'],
  ['/panel/videos', '/admin-hub?tab=content&sub=videos'],
  ['/panel/recordings', '/admin-hub?tab=content&sub=recordings'],
  ['/panel/forms', '/admin-hub?tab=content&sub=forms'],
  ['/panel/landing-pages', '/admin-hub?tab=site&sub=landing-pages'],
  ['/panel/homepage', '/admin-hub?tab=site&sub=homepage'],
  ['/panel/theme', '/admin-hub?tab=site&sub=theme'],
  ['/panel/faqs', '/admin-hub?tab=site&sub=faqs'],
  ['/panel/testimonials', '/admin-hub?tab=site&sub=testimonials'],
  ['/panel/bug-reports', '/admin-hub?tab=system&sub=bug-reports'],
  ['/panel/chat-assistant', '/admin-hub?tab=system&sub=chat-assistant'],
  ['/panel/settings', '/admin-hub?tab=system&sub=settings'],
];

/** Protected-shell redirects (rendered inside ProtectedAppShell) */
export const PROTECTED_REDIRECTS: [string, string][] = [
  // Legacy AION / coach-workspace aliases → client home
  ['/now', '/home'],
  ['/plan', '/home'],
  ['/play', '/home'],
  ['/play-hub', '/home'],
  ['/tactics', '/home'],
  ['/arena', '/home'],
  ['/dashboard', '/home'],
  ['/hallway', '/home'],
  ['/hallway/:slug', '/home'],
  ['/work', '/home'],
  ['/work-hub', '/home'],
  ['/journal-hub', '/home'],
  ['/life', '/home'],
  ['/life-plan', '/home'],
  ['/career', '/home'],
  // All chat collapses into the global AION widget on /home
  ['/chat', '/home'],
  ['/messages', '/home'],
  ['/messages/*', '/home'],
  // Profile → unified /me (opens profile modal)
  ['/profile', '/me'],
  ['/profile-hub', '/me'],
  ['/me/coach', '/me'],
  // Career hubs collapse
  ['/creator-hub', '/home'],
  ['/freelancer-hub', '/home'],
  // Strategy maze deep-links still resolve to the canonical action surface
  ['/personal-hypnosis/success', '/journey'],
  ['/personal-hypnosis/pending', '/journey'],
  ['/journey/*', '/journey'],
  // Legacy AION namespace → flat canonical (kept for deep-links)
  ['/mindos', '/home'],
  ['/mindos/chat', '/home'],
  ['/mindos/strategy', '/journey'],
  ['/mindos/tactics', '/journey'],
  ['/mindos/work', '/home'],
  ['/mindos/journal', '/journal'],
];

export function renderRedirectRoutes() {
  // Panel-specific redirects first (more specific paths)
  const panelRoutes = PANEL_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
  // Then simple redirects
  const simpleRoutes = SIMPLE_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
  // Public-shell flat redirects (e.g. /index → /)
  const publicRoutes = PUBLIC_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
  return [...panelRoutes, ...simpleRoutes, ...publicRoutes];
}

export function renderProtectedRedirectRoutes() {
  return PROTECTED_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
}
