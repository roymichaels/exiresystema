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
        'bg-background/98 backdrop-blur-2xl border-t border-border/40',
        'shadow-[0_-2px_12px_-4px_rgba(0,0,0,0.15)]',
        'pb-[env(safe-area-inset-bottom,0px)]',
        'h-[72px] md:h-[68px]',
      )}
      aria-label="ניווט תחתון"
    >
      <ul className="mx-auto flex items-stretch justify-around h-full px-1 max-w-md md:max-w-lg">
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
                  'w-full flex flex-col items-center justify-center gap-1 transition-all h-full min-h-[56px] relative rounded-xl',
                  isActive ? 'text-foreground' : 'text-muted-foreground/70',
                  isActive && 'shadow-[0_0_0_2px_rgba(168,85,247,0.35)]',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span className="absolute -top-[6px] left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary" />
                )}
                <Icon
                  className={cn('w-5 h-5 md:w-6 md:h-6', isActive && 'text-primary')}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span className={cn('text-[11px] md:text-[11.5px] leading-none tracking-tight', isActive ? 'font-semibold' : 'font-medium')}>
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
