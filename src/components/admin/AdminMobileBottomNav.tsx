/**
 * AdminMobileBottomNav — Single fixed bottom nav for Admin Hub (all screen sizes).
 * Touch-first OS model: 5 primary tabs (היום / לידים / מתאמנים / סטודיו / עוד).
 * This is the ONLY primary admin navigation — no top nav row.
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ADMIN_TABS } from '@/domain/admin';

const PRIMARY_IDS = ['today', 'leads', 'clients', 'studio', 'more'];

interface Props {
  activeTab: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export function AdminMobileBottomNav({ activeTab, onTabChange }: Props) {
  const { language } = useTranslation();
  const primary = PRIMARY_IDS
    .map((id) => ADMIN_TABS.find((t) => t.id === id))
    .filter(Boolean) as typeof ADMIN_TABS;

  const handlePick = (tabId: string) => {
    const tab = ADMIN_TABS.find((t) => t.id === tabId);
    onTabChange?.(tabId, tab?.subTabs[0]?.id);
  };

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60]',
        'bg-background/95 backdrop-blur-xl border-t border-border/40',
        'pb-[env(safe-area-inset-bottom,0px)]',
        'h-[64px] sm:h-[68px]',
      )}
      aria-label="ניווט תחתון"
    >
      <ul className="flex items-stretch justify-around h-full px-1">
        {primary.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'more' && activeTab === 'legacy');
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => handlePick(tab.id)}
                className={cn(
                  'w-full flex flex-col items-center justify-center gap-0.5 transition-colors h-full min-h-[48px]',
                  isActive ? 'text-foreground' : 'text-muted-foreground/50',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn('w-[22px] h-[22px]', isActive && 'text-primary')}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className={cn('text-[11px] leading-tight', isActive ? 'font-semibold' : 'font-medium')}>
                  {language === 'he' ? tab.labelHe : language === 'es' ? tab.labelEs : tab.labelEn}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
