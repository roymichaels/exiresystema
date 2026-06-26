/**
 * AdminMobileBottomNav — Mobile-only fixed bottom nav for Admin Hub.
 * Touch-first OS model: 5 primary tabs (היום / לידים / מתאמנים / סטודיו / עוד).
 * "עוד" navigates to the More launcher screen (not a sheet flea market).
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
  const isHe = language === 'he';

  const primary = PRIMARY_IDS
    .map((id) => ADMIN_TABS.find((t) => t.id === id))
    .filter(Boolean) as typeof ADMIN_TABS;

  const handlePick = (tabId: string) => {
    const tab = ADMIN_TABS.find((t) => t.id === tabId);
    // Always land on the first sub-tab (the launcher screen for studio/more).
    onTabChange?.(tabId, tab?.subTabs[0]?.id);
  };

  return (
    <nav
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-[60]',
        'bg-background/92 backdrop-blur-xl border-t border-border/40',
        'pb-[env(safe-area-inset-bottom,0px)]',
      )}
      aria-label={isHe ? 'ניווט תחתון' : 'Bottom navigation'}
    >
      <ul className="flex items-stretch justify-around px-1 pt-0.5">
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
                  'w-full flex flex-col items-center gap-px py-0.5 rounded-md transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground/65',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn('w-[16px] h-[16px]', isActive && 'text-primary')}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className={cn('text-[9.5px] leading-none', isActive ? 'font-semibold' : 'font-medium')}>
                  {isHe ? tab.labelHe : tab.labelEn}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
