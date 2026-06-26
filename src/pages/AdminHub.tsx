/**
 * @tab Admin
 * @purpose Unified admin control center — sidebar-less, everything inline
 */

import { Suspense, useMemo, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ADMIN_TABS } from '@/domain/admin';
import { AdminInlineNav } from '@/components/admin/AdminInlineNav';
import { AdminStatsBar } from '@/components/admin/AdminStatsBar';
import { AdminMobileBottomNav } from '@/components/admin/AdminMobileBottomNav';
import { AdminMobileSubNav } from '@/components/admin/AdminMobileSubNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';

import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface AdminHubProps {
  activeTab?: string;
  activeSubTab?: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export default function AdminHub({ activeTab = 'today', activeSubTab, onTabChange }: AdminHubProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [statsOpen, setStatsOpen] = useState(false);

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
      className="relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y px-3 sm:px-4 space-y-2.5 md:space-y-4"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2.75rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)',
      }}
    >
      {/* Mobile app-bar: ultra-thin. Title + tiny status chip. */}
      <div className="md:hidden -mx-3 px-3 h-10 flex items-center justify-between gap-2 bg-background/90 backdrop-blur-md border-b border-border/30 sticky top-0 z-10">
        <h1 className="text-[14.5px] font-semibold truncate min-w-0">
          {isHe ? currentTabConfig.labelHe : currentTabConfig.labelEn}
        </h1>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setStatsOpen((v) => !v)}
          className="h-7 px-2 text-[11px] gap-1 text-muted-foreground/80 hover:text-foreground"
          aria-expanded={statsOpen}
        >
          {isHe ? 'סטטוס' : 'Status'}
          <ChevronDown className={cn('w-3 h-3 transition-transform', statsOpen && 'rotate-180')} />
        </Button>
      </div>


      {/* Stats bar — desktop always, mobile only when toggled */}
      <ErrorBoundary fallback={<div className="h-12" />}>
        <div className={cn('md:block', statsOpen ? 'block' : 'hidden')}>
          <AdminStatsBar onNavigate={onTabChange} />
        </div>
      </ErrorBoundary>

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
