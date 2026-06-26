/**
 * AdminInlineNav — Desktop tab navigation.
 *
 * Phase IA-6 touch-first OS:
 *  - 5 primary group buttons rendered as large pill cards (not a tab rail).
 *  - Sub-tabs are NOT shown by default. They open one tap deeper — the
 *    Studio / More groups land on a card launcher screen which renders
 *    them. Today / Leads / Clients have only one sub-screen anyway.
 *  - Legacy/archive shows a tiny ghost link, never as a peer group.
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ADMIN_TABS } from '@/domain/admin';
import { ChevronRight, ChevronLeft, Archive } from 'lucide-react';

interface AdminInlineNavProps {
  activeTab: string;
  activeSubTab: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

const LAUNCHER_TABS: Record<string, string> = {
  studio: 'studio-home',
  more: 'more-home',
};

export function AdminInlineNav({ activeTab, activeSubTab, onTabChange }: AdminInlineNavProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const currentTabConfig = ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0];
  const visibleTabs = ADMIN_TABS.filter(t => !t.hidden);
  const archivedTabs = ADMIN_TABS.filter(t => t.hidden);
  const launcherSubId = LAUNCHER_TABS[activeTab];
  const onLauncher = launcherSubId && (!activeSubTab || activeSubTab === launcherSubId);
  const activeSub = currentTabConfig.subTabs.find((s) => s.id === activeSubTab);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="hidden md:block space-y-3">
      {/* Primary group cards */}
      <div className="grid grid-cols-5 gap-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'more' && activeTab === 'legacy');
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id, tab.subTabs[0]?.id)}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-2xl border text-start transition-all',
                'active:scale-[0.98]',
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground shadow-sm'
                  : 'bg-card/60 border-border/40 text-muted-foreground hover:bg-accent/10 hover:text-foreground',
              )}
            >
              <div
                className={cn(
                  'rounded-xl p-2 shrink-0',
                  isActive ? 'bg-emerald-500/15' : 'bg-muted/60',
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {isHe ? tab.labelHe : tab.labelEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-screen breadcrumb (only for studio/more when drilled in) */}
      {launcherSubId && !onLauncher && activeSub && (
        <button
          type="button"
          onClick={() => onTabChange?.(activeTab, launcherSubId)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-card/40 text-sm hover:bg-muted/40 transition-colors"
        >
          <BackIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground text-xs">
            {isHe ? currentTabConfig.labelHe : currentTabConfig.labelEn}
          </span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-medium">
            {isHe ? activeSub.labelHe : activeSub.labelEn}
          </span>
        </button>
      )}

      {/* Archive ghost (legacy) */}
      {archivedTabs.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {archivedTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id, tab.subTabs[0]?.id)}
                title={isHe ? 'ארכיון — כלים ישנים' : 'Archive — legacy tools'}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] tracking-wide transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground',
                )}
              >
                <Archive className="w-3 h-3 opacity-70" />
                {isHe ? tab.labelHe : tab.labelEn}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
