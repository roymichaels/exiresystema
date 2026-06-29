import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { UserNotificationPanel } from "./UserNotificationPanel";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { useTranslation } from "@/hooks/useTranslation";

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

export const UserNotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useUserNotifications();
  const { language } = useTranslation();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const panel = (
    <UserNotificationPanel
      notifications={notifications.slice(0, 10)}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClose={() => setOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      {isMobile ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`relative h-10 w-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${isAnimating ? 'animate-bounce' : ''}`}
            style={{
              backgroundColor: 'hsl(var(--gold) / 0.12)',
              boxShadow: unreadCount > 0 ? '0 0 8px hsl(var(--gold-glow) / 0.3)' : 'none'
            }}
          >
            <Bell className="h-5 w-5" style={{ color: 'hsl(var(--gold))' }} />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] rounded-full animate-pulse"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
          <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
              side="bottom"
              className="rounded-t-3xl p-0 pb-[max(env(safe-area-inset-bottom),1rem)] max-h-[80vh] overflow-y-auto bg-background border-border/40"
            >
              <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-base font-semibold">{language === 'he' ? 'התראות' : language === 'es' ? 'Notificaciones' : 'Notifications'}</SheetTitle>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </SheetHeader>
              {panel}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        /* Desktop: popover */
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              className={`relative h-10 w-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${isAnimating ? 'animate-bounce' : ''}`}
              style={{
                backgroundColor: 'hsl(var(--gold) / 0.12)',
                boxShadow: unreadCount > 0 ? '0 0 8px hsl(var(--gold-glow) / 0.3)' : 'none'
              }}
            >
              <Bell className="h-5 w-5" style={{ color: 'hsl(var(--gold))' }} />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] rounded-full animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-96 p-0"
            dir={language === 'he' ? 'rtl' : 'ltr'}
            avoidCollisions={true}
            collisionPadding={{ right: 16, left: 16 }}
          >
            {panel}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
