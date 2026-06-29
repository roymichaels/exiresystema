import { useState } from "react";
import { useAdminNotifications, AdminNotification } from "@/hooks/useAdminNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { es, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from '@/hooks/useTranslation';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-destructive text-destructive-foreground';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-blue-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPriorityLabel = (priority: string, language: string) => {
  switch (priority) {
    case 'urgent': return language === 'he' ? 'דחוף' : language === 'es' ? 'Urgente' : 'Urgent';
    case 'high': return language === 'he' ? 'גבוה' : language === 'es' ? 'Alto' : 'High';
    case 'medium': return language === 'he' ? 'בינוני' : language === 'es' ? 'Medio' : 'Medium';
    default: return language === 'he' ? 'נמוך' : language === 'es' ? 'Bajo' : 'Low';
  }
};

const getTypeLabel = (type: string, language: string) => {
  const labels: Record<string, { he: string; en: string; es: string }> = {
    new_user: { he: 'משתמש חדש', en: 'New User', es: 'Nuevo usuario' },
    new_purchase: { he: 'רכישה', en: 'Purchase', es: 'Compra' },
    new_subscription: { he: 'מנוי חדש', en: 'New Subscription', es: 'Nueva suscripción' },
    subscription_cancelled: { he: 'ביטול מנוי', en: 'Subscription Cancelled', es: 'Suscripción cancelada' },
    new_enrollment: { he: 'הרשמה', en: 'Enrollment', es: 'Inscripción' },
    course_completed: { he: 'קורס הושלם', en: 'Course Completed', es: 'Curso completado' },
    new_review: { he: 'ביקורת', en: 'Review', es: 'Reseña' },
    high_value_purchase: { he: 'רכישה גבוהה', en: 'High Value Purchase', es: 'Compra de alto valor' },
    payment_failed: { he: 'תשלום נכשל', en: 'Payment Failed', es: 'Pago fallido' },
    content_uploaded: { he: 'תוכן חדש', en: 'New Content', es: 'Contenido nuevo' },
    onboarding_completed: { he: 'השלמת כיול', en: 'Onboarding Completed', es: 'Incorporación completada' },
    new_lead: { he: 'ליד חדש', en: 'New Lead', es: 'Nuevo lead' },
    journey_completion: { he: 'השלמת מסע', en: 'Journey Completion', es: 'Viaje completado' },
    user_milestone: { he: 'אבן דרך', en: 'Milestone', es: 'Hito' },
    new_consciousness_leap_application: { he: 'בקשת קפיצת תודעה', en: 'Consciousness Leap Application', es: 'Solicitud de salto de conciencia' },
    new_personal_hypnosis_order: { he: 'הזמנת היפנוזה', en: 'Hypnosis Order', es: 'Pedido de hipnosis' },
    affiliate_referral: { he: 'הפניית שותף', en: 'Affiliate Referral', es: 'Referido de afiliado' },
  };
  const entry = labels[type];
  if (!entry) return type;
  if (language === 'he') return entry.he;
  if (language === 'es') return entry.es;
  return entry.en;
};

const NotificationCenter = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useAdminNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleSearch = () => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (selectedType !== "all") filters.type = selectedType;
    if (selectedPriority !== "all") filters.priority = selectedPriority;
    if (activeTab === "unread") filters.is_read = false;
    if (activeTab === "read") filters.is_read = true;
    fetchNotifications(filters);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread" && n.is_read) return false;
    if (activeTab === "read" && !n.is_read) return false;
    return true;
  });

  const dateLocale = language === 'he' ? he : language === 'es' ? es : enUS;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-glow flex items-center gap-2">
            <Bell className="h-8 w-8" />
            {language === 'he' ? 'מרכז התראות' : language === 'es' ? 'Centro de Notificaciones' : 'Notification Center'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'he' ? 'נהל את כל ההתראות שלך במקום אחד' : language === 'es' ? 'Gestiona todas tus notificaciones en un solo lugar' : 'Manage all your notifications in one place'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="gap-2">
            <CheckCheck className="h-4 w-4" />
            {language === 'he' ? `סמן הכל כנקרא (${unreadCount})` : language === 'es' ? `Marcar todo como leído (${unreadCount})` : `Mark All as Read (${unreadCount})`}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            {language === 'he' ? 'סה"כ התראות' : language === 'es' ? 'Total notificaciones' : 'Total Notifications'}
          </div>
          <div className="text-2xl font-bold mt-1">{notifications.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            {language === 'he' ? 'לא נקראו' : language === 'es' ? 'No leídas' : 'Unread'}
          </div>
          <div className="text-2xl font-bold mt-1 text-primary">{unreadCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            {language === 'he' ? 'התראות דחופות' : language === 'es' ? 'Notificaciones urgentes' : 'Urgent Notifications'}
          </div>
          <div className="text-2xl font-bold mt-1 text-destructive">
            {notifications.filter(n => n.priority === 'urgent' && !n.is_read).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            {language === 'he' ? 'היום' : language === 'es' ? 'Hoy' : 'Today'}
          </div>
          <div className="text-2xl font-bold mt-1">
            {notifications.filter(n => {
              const today = new Date();
              const notifDate = new Date(n.created_at);
              return notifDate.toDateString() === today.toDateString();
            }).length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {language === 'he' ? 'סינון' : language === 'es' ? 'Filtrar' : 'Filter'}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'he' ? 'חיפוש...' : language === 'es' ? 'Buscar...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-9"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'he' ? 'סוג התראה' : language === 'es' ? 'Tipo de notificación' : 'Notification Type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'he' ? 'כל הסוגים' : language === 'es' ? 'Todos los tipos' : 'All Types'}
              </SelectItem>
              <SelectItem value="new_user">
                {language === 'he' ? 'משתמש חדש' : language === 'es' ? 'Nuevo usuario' : 'New User'}
              </SelectItem>
              <SelectItem value="onboarding_completed">
                {language === 'he' ? 'השלמת כיול' : language === 'es' ? 'Incorporación completada' : 'Onboarding Completed'}
              </SelectItem>
              <SelectItem value="new_lead">
                {language === 'he' ? 'ליד חדש' : language === 'es' ? 'Nuevo lead' : 'New Lead'}
              </SelectItem>
              <SelectItem value="new_purchase">
                {language === 'he' ? 'רכישה' : language === 'es' ? 'Compra' : 'Purchase'}
              </SelectItem>
              <SelectItem value="new_subscription">
                {language === 'he' ? 'מנוי חדש' : language === 'es' ? 'Nueva suscripción' : 'New Subscription'}
              </SelectItem>
              <SelectItem value="subscription_cancelled">
                {language === 'he' ? 'ביטול מנוי' : language === 'es' ? 'Suscripción cancelada' : 'Subscription Cancelled'}
              </SelectItem>
              <SelectItem value="new_review">
                {language === 'he' ? 'ביקורת' : language === 'es' ? 'Reseña' : 'Review'}
              </SelectItem>
              <SelectItem value="payment_failed">
                {language === 'he' ? 'תשלום נכשל' : language === 'es' ? 'Pago fallido' : 'Payment Failed'}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'he' ? 'עדיפות' : language === 'es' ? 'Prioridad' : 'Priority'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'he' ? 'כל העדיפויות' : language === 'es' ? 'Todas las prioridades' : 'All Priorities'}
              </SelectItem>
              <SelectItem value="urgent">
                {language === 'he' ? 'דחוף' : language === 'es' ? 'Urgente' : 'Urgent'}
              </SelectItem>
              <SelectItem value="high">
                {language === 'he' ? 'גבוה' : language === 'es' ? 'Alto' : 'High'}
              </SelectItem>
              <SelectItem value="medium">
                {language === 'he' ? 'בינוני' : language === 'es' ? 'Medio' : 'Medium'}
              </SelectItem>
              <SelectItem value="low">
                {language === 'he' ? 'נמוך' : language === 'es' ? 'Bajo' : 'Low'}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            {language === 'he' ? 'חפש' : language === 'es' ? 'Buscar' : 'Search'}
          </Button>
        </div>
      </Card>

      {/* Notifications List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">
            {language === 'he' ? `הכל (${notifications.length})` : language === 'es' ? `Todo (${notifications.length})` : `All (${notifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread">
            {language === 'he' ? `לא נקראו (${unreadCount})` : language === 'es' ? `No leídas (${unreadCount})` : `Unread (${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="read">
            {language === 'he' ? `נקראו (${notifications.length - unreadCount})` : language === 'es' ? `Leídas (${notifications.length - unreadCount})` : `Read (${notifications.length - unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">
                    {language === 'he' ? 'טוען...' : language === 'es' ? 'Cargando...' : 'Loading...'}
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {language === 'he' ? 'אין התראות להצגה' : language === 'es' ? 'No hay notificaciones para mostrar' : 'No notifications to display'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-accent/50 ${
                        !notification.is_read ? 'bg-accent/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority Indicator */}
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          getPriorityColor(notification.priority)
                        }`} />

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type, language)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {getPriorityLabel(notification.priority, language)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {notification.link && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Message */}
                          <p className={`text-sm mb-2 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.message}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: dateLocale,
                              })}
                            </span>
                            {!notification.is_read && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => markAsRead(notification.id)}
                              >
                                {language === 'he' ? 'סמן כנקרא' : language === 'es' ? 'Marcar como leído' : 'Mark as Read'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
