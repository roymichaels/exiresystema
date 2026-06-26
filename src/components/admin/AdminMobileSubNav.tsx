/**
 * AdminMobileSubNav — Mobile-only sub-tab switcher for the active admin group.
 * ≤4 sub-tabs → inline segmented control.
 * >4 sub-tabs → compact "בחר מסך" button opening a bottom sheet.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ADMIN_TABS } from '@/domain/admin';
import { ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Props {
  activeTab: string;
  activeSubTab: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export function AdminMobileSubNav({ activeTab, activeSubTab, onTabChange }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [open, setOpen] = useState(false);

  const tab = ADMIN_TABS.find((t) => t.id === activeTab) || ADMIN_TABS[0];
  if (tab.subTabs.length <= 1) return null;

  const activeSub = tab.subTabs.find((s) => s.id === activeSubTab) || tab.subTabs[0];

  if (tab.subTabs.length <= 4) {
    return (
      <div className="md:hidden -mx-1 px-1">
        <div className="flex w-full rounded-xl border border-border/50 bg-card/50 p-1 gap-1">
          {tab.subTabs.map((sub) => {
            const isActive = sub.id === activeSub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onTabChange?.(activeTab, sub.id)}
                className={cn(
                  'flex-1 min-w-0 truncate rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground',
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

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-sm"
      >
        <span className="font-medium truncate">
          {isHe ? activeSub.labelHe : activeSub.labelEn}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[75vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
        >
          <SheetHeader>
            <SheetTitle className="text-start">
              {isHe ? 'בחר מסך' : 'Choose screen'}
            </SheetTitle>
          </SheetHeader>
          <ul className="mt-4 flex flex-col gap-1.5">
            {tab.subTabs.map((sub) => {
              const isActive = sub.id === activeSub.id;
              return (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onTabChange?.(activeTab, sub.id);
                    }}
                    className={cn(
                      'w-full rounded-xl border px-3 py-3 text-start text-sm transition-colors',
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                        : 'bg-card/60 border-border/50 text-foreground hover:bg-accent/10',
                    )}
                  >
                    {isHe ? sub.labelHe : sub.labelEn}
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
