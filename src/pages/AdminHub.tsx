/**
 * @tab Admin
 * @purpose Unified admin control center.
 *
 * Layout is provided by AdminPanelShell:
 *   - desktop: left sidebar + centered content
 *   - mobile: global header + bottom nav
 */

import { Suspense, useMemo } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ADMIN_TABS } from '@/domain/admin';
import { AdminMobileBottomNav } from '@/components/admin/AdminMobileBottomNav';
import { AdminMobileSubNav } from '@/components/admin/AdminMobileSubNav';
import { AdminPanelShell } from '@/components/admin/AdminPanelShell';
import { useTenant } from '@/contexts/TenantContext';
import PhysioPlaceholder from '@/components/admin/PhysioPlaceholder';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AdminHubProps {
  activeTab?: string;
  activeSubTab?: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export default function AdminHub({ activeTab = 'today', activeSubTab, onTabChange }: AdminHubProps) {
  const { currentTenantSlug } = useTenant();

  const currentTabConfig = useMemo(
    () => ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0],
    [activeTab]
  );

  const currentSubTab = activeSubTab || currentTabConfig.subTabs[0]?.id || '';

  const ActiveSubComponent = useMemo(() => {
    const sub = currentTabConfig.subTabs.find(s => s.id === currentSubTab);
    return sub?.component || currentTabConfig.subTabs[0]?.component;
  }, [currentTabConfig, currentSubTab]);

  return (
    <AdminPanelShell
      activeTab={activeTab}
      activeSubTab={currentSubTab}
      onTabChange={onTabChange || (() => {})}
    >
      {/* Mobile sub-tab back pill (hidden on Advisor — AdvisorPanel has its own back button) */}
      {!(activeTab === 'more' && currentSubTab === 'advisor') && (
        <ErrorBoundary fallback={null}>
          <AdminMobileSubNav
            activeTab={activeTab}
            activeSubTab={currentSubTab}
            onTabChange={onTabChange}
          />
        </ErrorBoundary>
      )}

      {/* Active sub-page */}
      <ErrorBoundary
        key={`${activeTab}:${currentSubTab}`}
        fallback={
          <Card className="p-6 space-y-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold">
                This admin section failed to load
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The other tabs still work — switch tabs above, or reload to retry.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </Button>
          </Card>
        }
      >
        <Suspense fallback={<PageSkeleton />}>
          {currentTenantSlug === 'physiotherapy' ? (
            <PhysioPlaceholder />
          ) : (
            ActiveSubComponent && <ActiveSubComponent />
          )}
        </Suspense>
      </ErrorBoundary>

      {/* Bottom navigation — mobile only */}
      <AdminMobileBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </AdminPanelShell>
  );
}
