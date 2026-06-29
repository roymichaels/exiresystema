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
import { ADMIN_TABS } from '@/domain/admin';
import { ChevronRight, Archive } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { language } = useTranslation();
  const currentTabConfig = ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0];
  const visibleTabs = ADMIN_TABS.filter(t => !t.hidden);
  const archivedTabs = ADMIN_TABS.filter(t => t.hidden);
  const launcherSubId = LAUNCHER_TABS[activeTab];
  const onLauncher = launcherSubId && (!activeSubTab || activeSubTab === launcherSubId);
  const onMoreLauncher = activeTab === 'more' && onLauncher;
  const activeSub = currentTabConfig.subTabs.find((s) => s.id === activeSubTab);

  return (
    <div className="hidden md:block space-y-2">
      {/* Primary group cards — compact */}
      <div className="grid grid-cols-5 gap-1.5">
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
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-start transition-all',
                'active:scale-[0.98]',
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground shadow-sm'
                  : 'bg-card/60 border-border/40 text-muted-foreground hover:bg-accent/10 hover:text-foreground',
              )}
            >
              <div
                className={cn(
                  'rounded-lg p-1.5 shrink-0',
                  isActive ? 'bg-emerald-500/15' : 'bg-muted/60',
                )}
              >
                <Icon className="w-4.5 h-4.5" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">
                  {language === 'he' ? tab.labelHe : language === 'es' ? tab.labelEs : tab.labelEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-screen back pill (only for studio/more when drilled in) */}
      {launcherSubId && !onLauncher && activeSub && (
        <button
          type="button"
          onClick={() => onTabChange?.(activeTab, launcherSubId)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-card/40 text-sm hover:bg-muted/40 transition-colors w-full"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">
            {language === 'he' ? activeSub.labelHe : language === 'es' ? activeSub.labelEs : activeSub.labelEn}
          </span>
        </button>
      )}

      {/* Archive ghost — only on More launcher */}
      {onMoreLauncher && archivedTabs.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {archivedTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id, tab.subTabs[0]?.id)}
                title={language === 'he' ? 'ארכיון — כלים ישנים' : language === 'es' ? 'Archivo — herramientas antiguas' : 'Archive — legacy tools'}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] tracking-wide transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground',
                )}
              >
                <Archive className="w-3 h-3 opacity-70" />
                {language === 'he' ? tab.labelHe : language === 'es' ? tab.labelEs : tab.labelEn}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
