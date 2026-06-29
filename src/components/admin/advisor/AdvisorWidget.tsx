/**
 * AdvisorWidget — orchestrator that combines the brain trigger button
 * with a Sheet-based panel.
 *
 * Mobile: bottom Sheet (90dvh, rounded top)
 * Desktop: right-side Sheet (480px wide)
 *
 * Follows the same pattern as UserNotificationBell.
 */
import { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AdvisorTrigger } from './AdvisorTrigger';
import AdvisorPanel from './AdvisorPanel';

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
};

export default function AdvisorWidget() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <AdvisorTrigger onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        {isMobile ? (
          <SheetContent
            side="bottom"
            className="rounded-t-3xl p-0 pb-[max(env(safe-area-inset-bottom),0.5rem)] h-[90dvh] overflow-y-auto bg-background border-border/40 flex flex-col"
            hideClose
          >
            {/* Drag handle */}
            <div className="shrink-0 mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-muted-foreground/20" />
            <div className="flex-1 min-h-0 px-3 pb-2">
              <AdvisorPanel variant="widget" onClose={() => setOpen(false)} />
            </div>
          </SheetContent>
        ) : (
          <SheetContent
            side="right"
            className="w-[480px] max-w-[90vw] p-0 bg-background border-border/40 flex flex-col"
            hideClose
          >
            <div className="flex-1 min-h-0 p-4 pb-0">
              <AdvisorPanel variant="widget" onClose={() => setOpen(false)} />
            </div>
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}
