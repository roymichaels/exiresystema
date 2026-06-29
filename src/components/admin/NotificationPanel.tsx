import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { AdminNotification } from "@/hooks/useAdminNotifications";
import { Bell, CheckCheck, ExternalLink, UserPlus, FileText, Megaphone, Brain, Headphones, Trophy, ShoppingCart, Star, CreditCard, BookOpen, AlertTriangle, Compass } from "lucide-react";

interface NotificationPanelProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-destructive/20 text-destructive';
    case 'high': return 'bg-orange-500/20 text-orange-500';
    case 'medium': return 'bg-blue-500/20 text-blue-500';
    default: return 'bg-muted/40 text-muted-foreground';
  }
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_user': return UserPlus;
    case 'new_lead': return Megaphone;
    case 'new_consciousness_leap_application': return Brain;
    case 'new_personal_hypnosis_order': return Headphones;
    case 'onboarding_completed': return Compass;
    case 'journey_completion':
    case 'user_milestone': return Trophy;
    case 'new_purchase':
    case 'high_value_purchase': return ShoppingCart;
    case 'new_review': return Star;
    case 'new_enrollment':
    case 'course_completed': return BookOpen;
    case 'content_uploaded': return FileText;
    case 'new_subscription':
    case 'subscription_cancelled': return CreditCard;
    case 'payment_failed': return AlertTriangle;
    default: return Bell;
  }
};

const resolveNotificationLink = (notification: AdminNotification): string | null => {
  const link = notification.link;
  if (link && link.startsWith('/admin-hub')) return link;

  const meta = notification.metadata || {};
  const userId = meta.user_id as string | undefined;

  switch (notification.type) {
    case 'new_user':
    case 'onboarding_completed':
    case 'journey_completion':
    case 'user_milestone':
    case 'new_personal_hypnosis_order':
    case 'new_subscription':
    case 'subscription_cancelled':
    case 'new_purchase':
    case 'high_value_purchase':
    case 'payment_failed':
      return '/admin-hub?tab=admin&sub=users';
    case 'new_lead':
      return '/admin-hub?tab=leads';
    case 'new_consciousness_leap_application':
      return '/admin-hub?tab=campaigns&sub=consciousness-leap';
    case 'new_enrollment':
    case 'course_completed':
    case 'content_uploaded':
    case 'new_review':
      return '/admin-hub?tab=content&sub=courses';
    default:
      if (link && (link.startsWith('/panel/') || link.startsWith('/admin/'))) return '/admin-hub';
      return link;
  }
};

export const NotificationPanel = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationPanelProps) => {
  const navigate = useNavigate();

  const handleClick = (notification: AdminNotification) => {
    if (!notification.is_read) onMarkAsRead(notification.id);
    const link = resolveNotificationLink(notification);
    if (link) { navigate(link); onClose(); }
  };

  const unread = notifications.filter(n => !n.is_read);

  return (
    <div className="bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">התראות</h3>
          {unread.length > 0 && (
            <Badge variant="destructive" className="rounded-full text-[10px] h-5 px-1.5">
              {unread.length}
            </Badge>
          )}
        </div>
        {unread.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="gap-1 text-xs h-8">
            <CheckCheck className="h-3 w-3" />
            סמן הכל כנקרא
          </Button>
        )}
      </div>

      {/* List */}
      <ScrollArea className="h-[400px] md:h-[400px] max-h-[60vh]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">אין התראות חדשות</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const link = resolveNotificationLink(notification);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`px-4 py-3 transition-colors cursor-pointer hover:bg-accent/40 ${
                    !notification.is_read ? 'bg-accent/15' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      !notification.is_read ? getPriorityColor(notification.priority) : 'bg-muted/40 text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h4 className={`text-sm font-medium truncate ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && notification.priority !== 'low' && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${getPriorityColor(notification.priority)}`}>
                            {notification.priority === 'urgent' ? 'דחוף' : notification.priority === 'high' ? 'גבוה' : ''}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs line-clamp-2 mt-0.5 ${!notification.is_read ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: he })}
                        </span>
                        {link && <ExternalLink className="h-3 w-3 text-muted-foreground/50" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border/30 bg-card">
          <Button
            variant="ghost"
            className="w-full text-sm h-10"
            onClick={() => { navigate('/admin-hub?tab=overview&sub=notifications'); onClose(); }}
          >
            צפה בכל ההתראות
          </Button>
        </div>
      )}
    </div>
  );
};
