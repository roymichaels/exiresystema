/**
 * AdminInlineNav — Inline tab + sub-tab navigation for Admin hub (replaces sidebar).
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ADMIN_TABS } from '@/domain/admin';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface AdminInlineNavProps {
  activeTab: string;
  activeSubTab: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export function AdminInlineNav({ activeTab, activeSubTab, onTabChange }: AdminInlineNavProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const currentTabConfig = ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0];
  const visibleTabs = ADMIN_TABS.filter(t => !t.hidden);
  const archivedTabs = ADMIN_TABS.filter(t => t.hidden);

  return (
    <div className="hidden md:block space-y-2">

      {/* Primary tabs */}
      <ScrollArea className="w-full">
        <div className="flex items-center gap-2 px-1 pb-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id, tab.subTabs[0]?.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all shrink-0",
                  isActive
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400 shadow-sm"
                    : "bg-card/60 border-border/40 text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {isHe ? tab.labelHe : tab.labelEn}
              </button>
            );
          })}
          {archivedTabs.length > 0 && (
            <>
              <div className="mx-1 h-6 w-px bg-border/50 shrink-0" aria-hidden />
              {archivedTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id, tab.subTabs[0]?.id)}
                    title={isHe ? 'ארכיון — כלים ישנים' : 'Archive — legacy tools'}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground/70 hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    {isHe ? tab.labelHe : tab.labelEn}
                  </button>
                );
              })}
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Sub-tabs */}
      {currentTabConfig.subTabs.length > 1 && (
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 px-1 pb-1">
            {currentTabConfig.subTabs.map((sub) => {
              const isSubActive = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onTabChange?.(activeTab, sub.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all shrink-0",
                    isSubActive
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 dark:text-emerald-400"
                      : "bg-muted/30 border-border/20 text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                  )}
                >
                  {isHe ? sub.labelHe : sub.labelEn}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
