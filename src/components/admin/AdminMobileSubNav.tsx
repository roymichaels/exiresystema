/**
 * AdminMobileSubNav — Mobile-only sub-tab switcher for the active admin group.
 *
 * Touch-first rule:
 *  - On group launcher screens (studio-home / more-home) we render NOTHING.
 *    The cards in the launcher are the navigation; we don't want a second
 *    layer of horizontal tab strips on the first level.
 *  - On a specific sub-screen, we show only a small "← back" pill that returns
 *    to the launcher. Sub-tools are one tap deeper, not all open at once.
 *  - Today / Leads / Clients each have a single sub-tab — nothing to render.
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ADMIN_TABS } from '@/domain/admin';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  activeTab: string;
  activeSubTab: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

const LAUNCHER_TABS: Record<string, string> = {
  studio: 'studio-home',
  more: 'more-home',
};

export function AdminMobileSubNav({ activeTab, activeSubTab, onTabChange }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const tab = ADMIN_TABS.find((t) => t.id === activeTab) || ADMIN_TABS[0];
  if (tab.subTabs.length <= 1) return null;

  const launcherSubId = LAUNCHER_TABS[activeTab];
  // On the launcher card-screen → render nothing.
  if (launcherSubId && (!activeSubTab || activeSubTab === launcherSubId)) return null;

  const activeSub = tab.subTabs.find((s) => s.id === activeSubTab) || tab.subTabs[0];
  const BackIcon = isHe ? ChevronRight : ChevronLeft;

  if (launcherSubId) {
    return (
      <div className="md:hidden -mx-1 px-1">
        <button
          type="button"
          onClick={() => onTabChange?.(activeTab, launcherSubId)}
          className={cn(
            'w-full flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-sm',
            'hover:bg-muted/50 transition-colors',
          )}
        >
          <BackIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground text-[12px]">
            {isHe ? (activeTab === 'studio' ? 'סטודיו' : 'עוד') : (activeTab === 'studio' ? 'Studio' : 'More')}
          </span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-medium truncate flex-1 text-start">
            {isHe ? activeSub.labelHe : activeSub.labelEn}
          </span>
        </button>
      </div>
    );
  }

  // Legacy / other multi-sub groups → keep an inline strip.
  return (
    <div className="md:hidden -mx-1 px-1 overflow-x-auto">
      <div className="flex gap-1.5 pb-1 min-w-max">
        {tab.subTabs.map((sub) => {
          const isActive = sub.id === activeSub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onTabChange?.(activeTab, sub.id)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground',
              )}
            >
              {isHe ? sub.labelHe : sub.labelEn}
            </button>
          );
        })}
      </div>
    </div>
  );
}
