/**
 * XSYSTEM Client Detail — Phase 1 shell with Overview tab only.
 * Future phases fill Sessions, Beliefs, Patterns, Inner Parts, Rooms, Audio, Check-ins.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MessageCircle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useClient } from '@/hooks/useClients';

const PHASE_PENDING = (
  <div className="text-sm text-muted-foreground py-12 text-center">
    יבנה בשלבים הבאים של XSYSTEM.
  </div>
);

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/admin-hub?tab=coach&sub=xsystem-clients')} className="gap-2 mb-4">
          <ArrowRight className="h-4 w-4" /> חזרה
        </Button>
        <Card><CardContent className="py-12 text-center text-muted-foreground">לקוח לא נמצא</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin-hub?tab=coach&sub=xsystem-clients')}
        className="gap-2"
      >
        <ArrowRight className="h-4 w-4" /> כל הלקוחות
      </Button>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-2xl">{client.full_name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                לקוח/ה מאז {new Date(client.created_at).toLocaleDateString('he-IL')}
              </p>
            </div>
            <Badge variant="outline">{client.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {client.phone && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`tel:${client.phone}`} dir="ltr"><Phone className="h-4 w-4" />{client.phone}</a>
              </Button>
            )}
            {(client.whatsapp || client.phone) && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a
                  href={`https://wa.me/${(client.whatsapp || client.phone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
            )}
            {client.email && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`mailto:${client.email}`}><Mail className="h-4 w-4" />{client.email}</a>
              </Button>
            )}
            {client.instagram_handle && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a
                  href={`https://instagram.com/${client.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4" />{client.instagram_handle}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">סקירה</TabsTrigger>
          <TabsTrigger value="sessions" disabled>סשנים</TabsTrigger>
          <TabsTrigger value="beliefs" disabled>אמונות</TabsTrigger>
          <TabsTrigger value="patterns" disabled>תבניות</TabsTrigger>
          <TabsTrigger value="parts" disabled>חלקים פנימיים</TabsTrigger>
          <TabsTrigger value="rooms" disabled>חדרים</TabsTrigger>
          <TabsTrigger value="audio" disabled>הקלטות</TabsTrigger>
          <TabsTrigger value="checkins" disabled>צ׳ק־אינים</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">הערות פנימיות</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap" dir="auto">
                {client.notes || (
                  <span className="text-muted-foreground">אין הערות עדיין.</span>
                )}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">{PHASE_PENDING}</TabsContent>
        <TabsContent value="beliefs">{PHASE_PENDING}</TabsContent>
        <TabsContent value="patterns">{PHASE_PENDING}</TabsContent>
        <TabsContent value="parts">{PHASE_PENDING}</TabsContent>
        <TabsContent value="rooms">{PHASE_PENDING}</TabsContent>
        <TabsContent value="audio">{PHASE_PENDING}</TabsContent>
        <TabsContent value="checkins">{PHASE_PENDING}</TabsContent>
      </Tabs>
    </div>
  );
}
