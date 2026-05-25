/**
 * Canonical Surfaces — the ONLY source of truth for top-level navigation.
 *
 * Private Coach app: surfaces are coach-shaped, not AION-shaped.
 * AION pages (/brain, /journey, /outer-world, /aurora) remain mounted
 * and reachable from admin tools, but are not part of the daily nav.
 */
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface CanonicalSurface {
  id: 'workspace' | 'clients' | 'content' | 'marketing' | 'admin' | 'profile';
  path: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
}

export const CANONICAL_SURFACES: readonly CanonicalSurface[] = [
  { id: 'workspace', path: '/workspace',                 icon: LayoutDashboard, labelEn: 'Workspace', labelHe: 'מרכז' },
  { id: 'clients',   path: '/workspace?tab=clients',     icon: Users,           labelEn: 'Clients',   labelHe: 'מתאמנים' },
  { id: 'content',   path: '/workspace?tab=content',     icon: FileText,        labelEn: 'Content',   labelHe: 'תוכן' },
  { id: 'marketing', path: '/workspace?tab=marketing',   icon: Megaphone,       labelEn: 'Marketing', labelHe: 'שיווק' },
  { id: 'admin',     path: '/admin-hub',                 icon: Shield,          labelEn: 'Admin',     labelHe: 'ניהול' },
  { id: 'profile',   path: '/me/coach',                  icon: User,            labelEn: 'Profile',   labelHe: 'פרופיל' },
] as const;

export type CanonicalSurfaceId = (typeof CANONICAL_SURFACES)[number]['id'];

/**
 * Map a legacy path → canonical surface + optional artifact intent.
 * Kept for AION's intent router; AION surfaces still resolve here.
 */
export const LEGACY_TO_SURFACE: Record<string, { path: string; artifact?: string }> = {
  '/aurora':    { path: '/workspace' },
  '/strategy':  { path: '/workspace', artifact: 'plan' },
  '/hypnosis':  { path: '/workspace', artifact: 'hypnosis' },
  '/journal':   { path: '/workspace', artifact: 'journal' },
  '/work':      { path: '/workspace', artifact: 'work' },
  '/play':      { path: '/workspace', artifact: 'missions' },
  '/now':       { path: '/workspace' },
  '/plan':      { path: '/workspace', artifact: 'plan' },
  '/journey':   { path: '/workspace' },
  '/chat':      { path: '/workspace?tab=clients' },
  '/outer-world': { path: '/workspace?tab=marketing' },
  '/community': { path: '/workspace?tab=marketing', artifact: 'community' },
  '/coaches':   { path: '/workspace' },
  '/fm':        { path: '/workspace', artifact: 'market' },
  '/messages':  { path: '/workspace?tab=clients', artifact: 'messages' },
  '/learn':     { path: '/workspace?tab=content', artifact: 'learn' },
  '/me':        { path: '/me/coach' },
  '/profile':   { path: '/me/coach' },
  '/dashboard': { path: '/workspace' },
  '/hallway':   { path: '/workspace' },
};
