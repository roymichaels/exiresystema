/**
 * @module contexts/TenantContext
 * @purpose Provide the current BizOS tenant to the React tree.
 *
 * Phase 1 only: UI-level tenant context. No database calls.
 * Persisted in localStorage.
 */
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  type Tenant,
  type TenantSlug,
  TENANTS,
  DEFAULT_TENANT_SLUG,
  TENANT_SLUGS,
  getTenant,
  isTenantSlug,
} from '@/config/tenants';

const STORAGE_KEY = 'bizos-current-tenant';

interface TenantContextValue {
  currentTenant: Tenant;
  currentTenantSlug: TenantSlug;
  setTenant: (slug: TenantSlug) => void;
  isTenantFeatureEnabled: (feature: string) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<TenantSlug>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isTenantSlug(stored)) return stored;
    } catch {
      // Ignore localStorage errors (e.g. private mode)
    }
    return DEFAULT_TENANT_SLUG;
  });

  useEffect(() => {
    try {
      if (isTenantSlug(slug)) {
        localStorage.setItem(STORAGE_KEY, slug);
      } else {
        localStorage.setItem(STORAGE_KEY, DEFAULT_TENANT_SLUG);
      }
    } catch {
      // Ignore
    }
  }, [slug]);

  const setTenant = useCallback((next: TenantSlug) => {
    if (isTenantSlug(next)) {
      setSlug(next);
    } else {
      setSlug(DEFAULT_TENANT_SLUG);
    }
  }, []);

  const currentTenant = useMemo(() => getTenant(slug), [slug]);

  const isTenantFeatureEnabled = useCallback(
    (feature: string) => currentTenant.features.includes(feature),
    [currentTenant]
  );

  const value = useMemo(
    () => ({
      currentTenant,
      currentTenantSlug: currentTenant.slug,
      setTenant,
      isTenantFeatureEnabled,
    }),
    [currentTenant, setTenant, isTenantFeatureEnabled]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return ctx;
}
