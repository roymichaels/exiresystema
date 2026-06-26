/**
 * AdminMobileBottomNav — Mobile-only fixed bottom nav for Admin Hub.
 * Shows 4 primary groups + "עוד" sheet for the rest. Desktop renders nothing.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ADMIN_TABS } from '@/domain/admin';
import { MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const PRIMARY_IDS = ['today', 'leads', 'clients', 'funnel'];

interface Props {
  activeTab: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export function AdminMobileBottomNav({ activeTab, onTabChange }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = PRIMARY_IDS
    .map((id) => ADMIN_TABS.find((t) => t.id === id))
    .filter(Boolean) as typeof ADMIN_TABS;
  const overflow = ADMIN_TABS.filter((t) => !PRIMARY_IDS.includes(t.id) && !t.hidden);
  const archived = ADMIN_TABS.filter((t) => t.hidden);
  const isMoreActive =
    overflow.some((t) => t.id === activeTab) || archived.some((t) => t.id === activeTab);

  const handlePick = (tabId: string, subId?: string) => {
    setMoreOpen(false);
    onTabChange?.(tabId, subId);
  };

  return (
    <>
      <nav
        className={cn(
          'md:hidden fixed inset-x-0 bottom-0 z-[60]',
          'bg-background/95 backdrop-blur-xl border-t border-border/60',
          'pb-[env(safe-area-inset-bottom,0px)]',
        )}
        aria-label={isHe ? 'ניווט תחתון' : 'Bottom navigation'}
      >
        <ul className="flex items-stretch justify-around px-1 pt-1.5">
          {primary.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => handlePick(tab.id, tab.subTabs[0]?.id)}
                  className={cn(
                    'w-full flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors',
                    isActive
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-muted-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">
                    {isHe ? tab.labelHe : tab.labelEn}
                  </span>
                </button>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'w-full flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors',
                isMoreActive
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-muted-foreground',
              )}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">{isHe ? 'עוד' : 'More'}</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[80vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
        >
          <SheetHeader>
            <SheetTitle className="text-start">
              {isHe ? 'בחר אזור' : 'Choose area'}
            </SheetTitle>
          </SheetHeader>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {overflow.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => handlePick(tab.id, tab.subTabs[0]?.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl border p-3 text-start transition-colors',
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                        : 'bg-card/60 border-border/50 text-foreground hover:bg-accent/10',
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">
                      {isHe ? tab.labelHe : tab.labelEn}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {archived.length > 0 && (
            <div className="mt-5 pt-3 border-t border-border/40">
              <div className="px-1 pb-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground/70">
                {isHe ? 'ארכיון' : 'Archive'}
              </div>
              <ul className="flex flex-col gap-1">
                {archived.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <li key={tab.id}>
                      <button
                        type="button"
                        onClick={() => handlePick(tab.id, tab.subTabs[0]?.id)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-start text-xs transition-colors',
                          isActive
                            ? 'bg-muted/60 text-foreground'
                            : 'text-muted-foreground hover:bg-muted/40',
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0 opacity-70" />
                        <span className="truncate">{isHe ? tab.labelHe : tab.labelEn}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
