/**
 * @tab Admin
 * @purpose Unified admin control center — slim shell, no stats noise.
 */

import { Suspense, useMemo } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ADMIN_TABS } from '@/domain/admin';
import { AdminInlineNav } from '@/components/admin/AdminInlineNav';
import { AdminMobileBottomNav } from '@/components/admin/AdminMobileBottomNav';
import { AdminMobileSubNav } from '@/components/admin/AdminMobileSubNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { useTranslation } from '@/hooks/useTranslation';

interface AdminHubProps {
  activeTab?: string;
  activeSubTab?: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export default function AdminHub({ activeTab = 'today', activeSubTab, onTabChange }: AdminHubProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';

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
    <main
      className="relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y px-3 sm:px-4 space-y-2 md:space-y-3"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2.5rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.25rem)',
      }}
    >
      {/* Mobile page-context row: title only. */}
      <div className="md:hidden flex items-center justify-between gap-2 pt-1 pb-0.5">
        <h1 className="text-[14px] font-semibold truncate min-w-0 text-foreground/85">
          {isHe ? currentTabConfig.labelHe : currentTabConfig.labelEn}
        </h1>
      </div>

      {/* Desktop page-context row: title only. */}
      <div className="hidden md:flex items-center justify-between gap-3 pt-1">
        <h1 className="text-lg font-semibold text-foreground/85">
          {isHe ? currentTabConfig.labelHe : currentTabConfig.labelEn}
        </h1>
      </div>

      {/* Desktop inline navigation (hidden on mobile) */}
      <ErrorBoundary
        fallback={
          <Card className="p-4 border-destructive/30 bg-destructive/5 text-sm">
            Navigation failed to render — try reloading.
          </Card>
        }
      >
        <AdminInlineNav
          activeTab={activeTab}
          activeSubTab={currentSubTab}
          onTabChange={onTabChange}
        />
      </ErrorBoundary>

      {/* Mobile sub-tab switcher */}
      <ErrorBoundary fallback={null}>
        <AdminMobileSubNav
          activeTab={activeTab}
          activeSubTab={currentSubTab}
          onTabChange={onTabChange}
        />
      </ErrorBoundary>

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
          {ActiveSubComponent && <ActiveSubComponent />}
        </Suspense>
      </ErrorBoundary>

      {/* Mobile bottom navigation */}
      <AdminMobileBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </main>
  );
}
