/**
 * Canonical Surfaces — the ONLY source of truth for top-level navigation.
 *
 * Client-first: every logged-in user (including the coach) gets the client
 * experience by default. Coach/admin tools live behind /admin-hub and are
 * appended to the nav only for users with the admin role (see DesktopSideNav).
 */
import {
  Home,
  GraduationCap,
  Users,
  User,
  Shield,
  type LucideIcon,
} from 'lucide-react';

export interface CanonicalSurface {
  id: 'home' | 'courses' | 'community' | 'profile' | 'admin';
  path: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  labelEs: string;
}

export const CANONICAL_SURFACES: readonly CanonicalSurface[] = [
  { id: 'home',      path: '/home',      icon: Home,           labelEn: 'Home',      labelHe: 'בית',      labelEs: 'Inicio' },
  { id: 'courses',   path: '/courses',   icon: GraduationCap,  labelEn: 'Courses',   labelHe: 'קורסים',   labelEs: 'Cursos' },
  { id: 'community', path: '/community', icon: Users,          labelEn: 'Community', labelHe: 'קהילה',    labelEs: 'Comunidad' },
  { id: 'profile',   path: '/me',        icon: User,           labelEn: 'Profile',   labelHe: 'פרופיל',   labelEs: 'Perfil' },
] as const;

/** Admin-only surface — appended to the nav by DesktopSideNav when the user is admin. */
export const ADMIN_SURFACE: CanonicalSurface = {
  id: 'admin', path: '/admin-hub', icon: Shield, labelEn: 'Admin', labelHe: 'ניהול', labelEs: 'Admin',
};

export type CanonicalSurfaceId = CanonicalSurface['id'];

/**
 * Map a legacy path → canonical surface + optional artifact intent.
 * Chat surfaces all collapse to /home — the global AION widget is the only chat UI.
 */
export const LEGACY_TO_SURFACE: Record<string, { path: string; artifact?: string }> = {
  '/aurora':      { path: '/home' },
  '/strategy':    { path: '/home', artifact: 'plan' },
  '/hypnosis':    { path: '/home', artifact: 'hypnosis' },
  '/journal':     { path: '/home', artifact: 'journal' },
  '/work':        { path: '/home', artifact: 'work' },
  '/play':        { path: '/home', artifact: 'missions' },
  '/now':         { path: '/home' },
  '/plan':        { path: '/home', artifact: 'plan' },
  '/journey':     { path: '/home' },
  '/chat':        { path: '/home' },
  '/messages':    { path: '/home' },
  '/outer-world': { path: '/community' },
  '/community':   { path: '/community' },
  '/coaches':     { path: '/home' },
  '/fm':          { path: '/home', artifact: 'market' },
  '/learn':       { path: '/courses' },
  '/me':          { path: '/me' },
  '/profile':     { path: '/me' },
  '/dashboard':   { path: '/home' },
  '/hallway':     { path: '/home' },
  '/workspace':   { path: '/admin-hub' },
};
