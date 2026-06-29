/**
 * ShellV2Header — fixed top chrome for ShellV2 routes.
 *
 * IA-7 — Admin (and per-client) routes render a *slim, opaque, single-bar*
 * header: brand on the leading edge, hamburger + notification bell trailing,
 * no centered AION wordmark and no floating orb. This kills the "two stacked
 * bars + content sliding under transparent chrome" feeling.
 *
 * Outside admin, the canonical AION header (centered wordmark + orb) is kept.
 */
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Info, Menu } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { zStyle } from './zindex';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { openInteractiveAION } from '@/components/aion/InteractiveAIONHost';
import { AionHeader } from '@/components/aion/ui';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import AdvisorWidget from '@/components/admin/advisor/AdvisorWidget';

export default function ShellV2Header() {
  const overlay = useOverlay();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [brandOpen, setBrandOpen] = useState(false);
  const brand = 'Exire Systema';
  const isHe = language === 'he';

  const isAdminContext = useMemo(
    () =>
      pathname.startsWith('/admin') ||
      pathname.startsWith('/admin-hub') ||
      pathname.startsWith('/clients/'),
    [pathname],
  );

  if (isAdminContext) {
    return (
      <>
        <header
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            ...zStyle('chrome'),
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}
          className={cn(
            'fixed inset-x-0 top-0 w-full',
            'bg-background/98 backdrop-blur-2xl',
            'border-b border-border/60',
            'shadow-[0_2px_12px_-6px_rgba(0,0,0,0.35)]',
          )}
          data-aion-header="admin-slim"
        >
          <div className="flex h-14 md:h-[60px] w-full items-center justify-between gap-1.5 px-3 sm:px-5">
            <button
              type="button"
              aria-label={isHe ? 'תפריט' : 'Menu'}
              onClick={() => overlay.open('drawer')}
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/85 transition-colors hover:bg-muted/60 hover:text-foreground active:scale-95"
            >
              <Menu className="h-[22px] w-[22px]" strokeWidth={1.9} />
            </button>

            <button
              type="button"
              onClick={() => setBrandOpen(true)}
              className="select-none px-2 py-1.5 text-[15px] md:text-[16px] font-semibold tracking-[0.22em] text-foreground active:scale-[0.97] transition"
              aria-label={isHe ? 'אודות' : 'About'}
            >
              EXIRE SYSTEMA
            </button>

            <div className="flex items-center gap-1">
              {user ? <><AdvisorWidget /><UserNotificationBell /></> : null}
            </div>
          </div>
        </header>

        <Sheet open={brandOpen} onOpenChange={setBrandOpen}>
          <SheetContent
            side="bottom"
            dir={isRTL ? 'rtl' : 'ltr'}
            className="rounded-t-3xl border-white/10 bg-background/85 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
            <SheetHeader className={isRTL ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2">
                <CanonicalAionModel size={32} ariaLabel="Exire Systema" />
                <SheetTitle className="text-lg">{brand}</SheetTitle>
              </div>
              <SheetDescription className="text-foreground/70">
                {isHe
                  ? 'מערכת ההפעלה של המאמן — לידים, מתאמנים, סטודיו.'
                  : 'The operator OS — leads, clients, studio.'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-xs text-foreground/60">
              <Info className="h-4 w-4 shrink-0" />
              <span>{isHe ? 'Exire Systema · קונסולה תפעולית' : 'Exire Systema · operator console'}</span>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
    <AionHeader
      brand={brand}
      style={zStyle('chrome')}
      onMenuClick={() => overlay.open('drawer')}
      onBrandClick={() => setBrandOpen(true)}
      onOrbClick={() => openInteractiveAION()}
      menuExtras={user ? <UserNotificationBell /> : null}
    />

    <Sheet open={brandOpen} onOpenChange={setBrandOpen}>
      <SheetContent
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-t-3xl border-white/10 bg-background/85 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <SheetHeader className={isRTL ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <CanonicalAionModel size={32} ariaLabel="Exire Systema" />
            <SheetTitle className="text-lg">{brand}</SheetTitle>
          </div>
          <SheetDescription className="text-foreground/70">
            {isHe
              ? 'הקורסים, הקהילה והמסע שלך — במקום אחד.'
              : 'Your courses, community, and journey — in one place.'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-xs text-foreground/60">
          <Info className="h-4 w-4 shrink-0" />
          <span>{isHe ? 'Exire Systema · אקוסיסטם של מאמן' : 'Exire Systema · coach ecosystem'}</span>
        </div>
      </SheetContent>
    </Sheet>

    </>
  );
}
