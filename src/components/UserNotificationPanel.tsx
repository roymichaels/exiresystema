import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { he, es, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { UserNotification } from "@/hooks/useUserNotifications";
import { Bell, ExternalLink, CheckCheck, Sparkles, ShoppingCart, GraduationCap, Clock, Sparkle, Star, User, Megaphone, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface UserNotificationPanelProps {
  notifications: UserNotification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onClose: () => void;
}

const NOTIF_ICONS: Record<string, LucideIcon> = {
  purchase_confirmed: ShoppingCart,
  purchase_success: ShoppingCart,
  course_completed: GraduationCap,
  access_expiring: Clock,
  new_content: Sparkle,
  subscription_renewed: Star,
  subscription_expiring: Clock,
  subscription_activated: Star,
  welcome: User,
  reminder: Megaphone,
  new_lead: Megaphone,
  new_purchase: ShoppingCart,
  payment_failed: CreditCard,
};

export const UserNotificationPanel = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: UserNotificationPanelProps) => {
  const navigate = useNavigate();
  const { language } = useTranslation();

  const handleNotificationClick = async (notification: UserNotification) => {
    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{language === 'he' ? 'התראות' : language === 'es' ? 'Notificaciones' : 'Notifications'}</span>
          </div>
          <div className="flex items-center gap-2">
            {unreadNotifications.length > 0 && (
              <>
                <span className="text-xs text-muted-foreground">
                  {unreadNotifications.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAllAsRead();
                  }}
                  className="h-6 px-2 text-[10px] gap-1 text-primary/80 hover:text-primary hover:bg-primary/10"
                >
                  <CheckCheck className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-6 text-center">
          <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{language === 'he' ? 'אין התראות חדשות' : language === 'es' ? 'No hay notificaciones nuevas' : 'No new notifications'}</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="divide-y divide-border/50">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const Icon = NOTIF_ICONS[notification.type] || Bell;
                return (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full p-3 flex items-start gap-2.5 hover:bg-muted/50 transition-colors text-start",
                      !notification.is_read && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      !notification.is_read ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium block",
                          !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {notification.title}
                        </span>
                        {!notification.is_read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>

                      <p className={cn(
                        "text-xs mt-0.5 line-clamp-2 leading-relaxed",
                        !notification.is_read ? 'text-foreground/60' : 'text-muted-foreground/60'
                      )}>
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: language === 'he' ? he : language === 'es' ? es : enUS,
                          })}
                        </span>
                        {notification.link && (
                          <ExternalLink className="h-3 w-3 text-primary/40" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 border-t bg-muted/20">
          <p className="text-[10px] text-center text-muted-foreground">
            <Sparkles className="w-3 h-3 inline-block me-1" />
            {language === 'he' ? 'לחץ על התראה לפרטים' : language === 'es' ? 'Haz clic en la notificación para ver detalles' : 'Click notification for details'}
          </p>
        </div>
      )}
    </div>
  );
};
