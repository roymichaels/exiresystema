/**
 * realmMood — Phase 5N.2.
 *
 * Single source of truth for the mood contract of each canonical realm.
 * Read-only constant table. Consumed by:
 *   - RealmTransitionLayer (veil hue)
 *   - useOrbPresenceBehaviour (default presence on arrival)
 *   - WorldAtmosphere (intensity bias)
 *   - AionNavDock (resonance floor)
 *
 * No backend, no provider, no runtime mutation.
 */
import type { CanonicalSurfaceId } from '@/navigation/canonicalSurfaces';
import type { OrbBehaviorState } from '@/aion/presence/orbBehavior';

export type TransitionTone = 'cool' | 'warm' | 'deep' | 'soft';
export type RealmInteraction = 'speak' | 'explore' | 'follow' | 'traverse' | 'resonate';

export interface RealmMood {
  id: CanonicalSurfaceId;
  hue: { primary: string; accent: string };
  presence: OrbBehaviorState;
  atmosphereIntensity: number;
  navResonance: number;
  transitionTone: TransitionTone;
  interaction: RealmInteraction;
}

export const REALM_MOOD: Record<CanonicalSurfaceId, RealmMood> = {
  home: {
    id: 'home',
    hue: { primary: '292 75% 60%', accent: '258 70% 60%' },
    presence: 'noticing',
    atmosphereIntensity: 0.5,
    navResonance: 0.65,
    transitionTone: 'soft',
    interaction: 'explore',
  },
  courses: {
    id: 'courses',
    hue: { primary: '188 78% 55%', accent: '42 90% 60%' },
    presence: 'guiding',
    atmosphereIntensity: 0.55,
    navResonance: 0.7,
    transitionTone: 'warm',
    interaction: 'follow',
  },
  messages: {
    id: 'messages',
    hue: { primary: '198 80% 56%', accent: '218 70% 30%' },
    presence: 'listening',
    atmosphereIntensity: 0.45,
    navResonance: 0.65,
    transitionTone: 'soft',
    interaction: 'speak',
  },
  community: {
    id: 'community',
    hue: { primary: '178 70% 45%', accent: '38 80% 55%' },
    presence: 'resonating',
    atmosphereIntensity: 0.6,
    navResonance: 0.6,
    transitionTone: 'deep',
    interaction: 'traverse',
  },
  profile: {
    id: 'profile',
    hue: { primary: '292 75% 60%', accent: '320 70% 60%' },
    presence: 'evolving',
    atmosphereIntensity: 0.5,
    navResonance: 0.65,
    transitionTone: 'soft',
    interaction: 'resonate',
  },
  admin: {
    id: 'admin',
    hue: { primary: '258 70% 60%', accent: '278 65% 45%' },
    presence: 'noticing',
    atmosphereIntensity: 0.6,
    navResonance: 0.6,
    transitionTone: 'deep',
    interaction: 'explore',
  },
};

/** Resolve mood by path (canonical surface path). */
export function moodForPath(pathname: string): RealmMood | null {
  const map: Record<string, CanonicalSurfaceId> = {
    '/home':      'home',
    '/courses':   'courses',
    '/messages':  'messages',
    '/community': 'community',
    '/me':        'profile',
    '/me/coach':  'profile',
    '/admin-hub': 'admin',
    '/workspace': 'admin',
  };
  const id = map[pathname];
  return id ? REALM_MOOD[id] : null;
}
