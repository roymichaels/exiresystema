/**
 * @module config/tenants
 * @purpose Static tenant definitions for BizOS.
 *
 * No database queries here. These constants drive the UI layer until tenant_id
 * is fully wired in the schema (Phase 2).
 */

export interface Tenant {
  id: string;
  slug: TenantSlug;
  name: string;
  brand: string;
  locale: string;
  /** Feature flags enabled for this tenant. */
  features: string[];
}

export type TenantSlug = 'exire-systema' | 'physiotherapy';

export const TENANTS: Record<TenantSlug, Tenant> = {
  'exire-systema': {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'exire-systema',
    name: 'Exire Systema',
    brand: 'Exire Systema',
    locale: 'he',
    features: [
      'dashboard',
      'leads',
      'clients',
      'studio',
      'advisor',
      'analytics',
      'settings',
      'integrations',
      'users',
    ],
  },
  physiotherapy: {
    id: '00000000-0000-0000-0000-000000000002',
    slug: 'physiotherapy',
    name: 'Physio Therapy',
    brand: 'Physio Therapy',
    locale: 'he',
    features: ['physio-dashboard', 'physio-patients', 'physio-appointments', 'physio-billing', 'settings'],
  },
};

export const DEFAULT_TENANT_SLUG: TenantSlug = 'exire-systema';
export const TENANT_SLUGS = Object.keys(TENANTS) as TenantSlug[];

export function isTenantSlug(value: string): value is TenantSlug {
  return value in TENANTS;
}

export function getTenant(slug: string): Tenant {
  if (isTenantSlug(slug)) return TENANTS[slug];
  return TENANTS[DEFAULT_TENANT_SLUG];
}
