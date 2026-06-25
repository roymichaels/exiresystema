/**
 * XSYSTEM Client Detail — Phase 2C.
 * 12 tabs: Overview, Intake, Sessions, Beliefs, Patterns, Inner Parts,
 * Rooms, Protocols, Audio, Check-ins, Payments, Timeline.
 *
 * Each tab shows list/count + empty state. Heavy CRUD is deferred to Phase 2D+.
 */
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Mail,
  Phone,
  MessageCircle,
  AtSign,
  Calendar,
  Brain,
  Repeat,
  Users,
  DoorOpen,
  ListChecks,
  Headphones,
  ClipboardCheck,
  CreditCard,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useClient, useClientProfile } from '@/hooks/useClients';
import {
  useXSystemSessions,
  useXSystemSessionsCount,
  useXSystemNextSession,
  useXSystemBeliefs,
  useXSystemActiveBeliefsCount,
  useXSystemPatterns,
  useXSystemPatternsCount,
  useXSystemInnerParts,
  useXSystemInnerPartsCount,
  useXSystemRooms,
  useXSystemClientRooms,
  useXSystemClientRoomsCount,
  useXSystemProtocols,
  useXSystemAudioAssignments,
  useXSystemAudioAssignmentsCount,
  useXSystemCheckins,
  useXSystemCheckinsCount,
  useXSystemPayments,
  useXSystemPaymentsCount,
  useXSystemPaymentsTotal,
  useXSystemFollowups,
  useXSystemOpenFollowupsCount,
} from '@/hooks/xsystem';

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-sm text-muted-foreground py-12 text-center border border-dashed rounded-lg">
      {label}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground truncate">{label}</div>
            <div className="text-lg font-semibold leading-tight">{value}</div>
            {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: profile } = useClientProfile(id);

  // Counts + lists
  const { data: sessionsCount = 0 } = useXSystemSessionsCount(id);
  const { data: sessions = [] } = useXSystemSessions(id);
  const { data: nextSession } = useXSystemNextSession(id);
  const { data: activeBeliefs = 0 } = useXSystemActiveBeliefsCount(id);
  const { data: beliefs = [] } = useXSystemBeliefs(id);
  const { data: patternsCount = 0 } = useXSystemPatternsCount(id);
  const { data: patterns = [] } = useXSystemPatterns(id);
  const { data: partsCount = 0 } = useXSystemInnerPartsCount(id);
  const { data: parts = [] } = useXSystemInnerParts(id);
  const { data: rooms = [] } = useXSystemRooms();
  const { data: clientRooms = [] } = useXSystemClientRooms(id);
  const { data: clientRoomsCount = 0 } = useXSystemClientRoomsCount(id);
  const { data: protocols = [] } = useXSystemProtocols();
  const { data: audio = [] } = useXSystemAudioAssignments(id);
  const { data: audioCount = 0 } = useXSystemAudioAssignmentsCount(id);
  const { data: checkins = [] } = useXSystemCheckins(id);
  const { data: checkinsCount = 0 } = useXSystemCheckinsCount(id);
  const { data: openFollowups = 0 } = useXSystemOpenFollowupsCount(id);
  const { data: followups = [] } = useXSystemFollowups(id);
  const { data: payments = [] } = useXSystemPayments(id);
  const { data: paymentsCount = 0 } = useXSystemPaymentsCount(id);
  const { data: paymentsTotal } = useXSystemPaymentsTotal(id);

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container max-w-5xl mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin-hub?tab=coach&sub=xsystem-clients')}
          className="gap-2 mb-4"
        >
          <ArrowRight className="h-4 w-4" /> חזרה
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            לקוח לא נמצא
          </CardContent>
        </Card>
      </div>
    );
  }

  const goals = (profile?.goals as unknown[]) || [];
  const issues = (profile?.presenting_issues as unknown[]) || [];

  const formatMoney = (cents: number, ccy: string) =>
    new Intl.NumberFormat('he-IL', { style: 'currency', currency: ccy || 'ILS' }).format(
      (cents || 0) / 100,
    );

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin-hub?tab=coach&sub=xsystem-clients')}
        className="gap-2"
      >
        <ArrowRight className="h-4 w-4" /> כל הלקוחות
      </Button>

      {/* Header */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <CardTitle className="text-2xl truncate">{client.full_name}</CardTitle>
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
                <a href={`tel:${client.phone}`} dir="ltr">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </a>
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
                <a href={`mailto:${client.email}`}>
                  <Mail className="h-4 w-4" />
                  {client.email}
                </a>
              </Button>
            )}
            {client.instagram_handle && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a
                  href={`https://instagram.com/${client.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AtSign className="h-4 w-4" />
                  {client.instagram_handle}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto justify-start">
          <TabsTrigger value="overview">סקירה</TabsTrigger>
          <TabsTrigger value="intake">אינטייק</TabsTrigger>
          <TabsTrigger value="sessions">סשנים ({sessionsCount})</TabsTrigger>
          <TabsTrigger value="beliefs">אמונות ({activeBeliefs})</TabsTrigger>
          <TabsTrigger value="patterns">תבניות ({patternsCount})</TabsTrigger>
          <TabsTrigger value="parts">חלקים ({partsCount})</TabsTrigger>
          <TabsTrigger value="rooms">חדרים ({clientRoomsCount})</TabsTrigger>
          <TabsTrigger value="protocols">פרוטוקולים</TabsTrigger>
          <TabsTrigger value="audio">הקלטות ({audioCount})</TabsTrigger>
          <TabsTrigger value="checkins">צ׳ק-אין ({checkinsCount})</TabsTrigger>
          <TabsTrigger value="payments">תשלומים ({paymentsCount})</TabsTrigger>
          <TabsTrigger value="timeline">ציר זמן</TabsTrigger>
        </TabsList>

        {/* ---------------- OVERVIEW ---------------- */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            <StatCard icon={Calendar} label="סשנים" value={sessionsCount} />
            <StatCard icon={Brain} label="אמונות פעילות" value={activeBeliefs} />
            <StatCard icon={Repeat} label="תבניות פעילות" value={patternsCount} />
            <StatCard icon={Users} label="חלקים פנימיים" value={partsCount} />
            <StatCard icon={DoorOpen} label="חדרים פעילים" value={clientRoomsCount} />
            <StatCard icon={ClipboardCheck} label="צ׳ק-אין ממתינים" value={checkinsCount} />
            <StatCard icon={FileText} label="פולואפים פתוחים" value={openFollowups} />
            <StatCard
              icon={CreditCard}
              label="סך תשלומים"
              value={formatMoney(paymentsTotal?.totalCents || 0, paymentsTotal?.currency || 'ILS')}
              hint={`${paymentsTotal?.count || 0} תשלומים`}
            />
            <StatCard
              icon={Calendar}
              label="סשן הבא"
              value={
                nextSession?.scheduled_at
                  ? new Date(nextSession.scheduled_at).toLocaleDateString('he-IL')
                  : '—'
              }
              hint={
                nextSession?.scheduled_at
                  ? new Date(nextSession.scheduled_at).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'לא נקבע'
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">פעולה מומלצת הבאה</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ממתין להגדרה — Phase 2D יקשר את ה-AION להמלצה דינמית.
              </p>
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {(goals.length > 0 || issues.length > 0) && (
            <div className="grid gap-3 md:grid-cols-2">
              {goals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">מטרות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pr-5 space-y-1 text-sm">
                      {goals.map((g, i) => (
                        <li key={i}>{typeof g === 'string' ? g : JSON.stringify(g)}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">סוגיות מרכזיות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pr-5 space-y-1 text-sm">
                      {issues.map((g, i) => (
                        <li key={i}>{typeof g === 'string' ? g : JSON.stringify(g)}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ---------------- INTAKE ---------------- */}
        <TabsContent value="intake" className="mt-4">
          {profile?.subconscious_summary ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">סיכום תת-מודע</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{profile.subconscious_summary}</p>
              </CardContent>
            </Card>
          ) : (
            <EmptyState label="אין עדיין נתוני אינטייק. ייווצרו אוטומטית מטפסים מקושרים." />
          )}
        </TabsContent>

        {/* ---------------- SESSIONS ---------------- */}
        <TabsContent value="sessions" className="mt-4">
          <XSystemSessionsTab clientId={id!} />
        </TabsContent>

        {/* ---------------- BELIEFS ---------------- */}
        <TabsContent value="beliefs" className="mt-4">
          <XSystemBeliefsTab clientId={id!} />
        </TabsContent>

        {/* ---------------- PATTERNS ---------------- */}
        <TabsContent value="patterns" className="mt-4">
          <XSystemPatternsTab clientId={id!} />
        </TabsContent>

        {/* ---------------- INNER PARTS ---------------- */}
        <TabsContent value="parts" className="mt-4">
          <XSystemInnerPartsTab clientId={id!} />
        </TabsContent>

        {/* ---------------- ROOMS ---------------- */}
        <TabsContent value="rooms" className="mt-4">
          <XSystemRoomsTab clientId={id!} />
        </TabsContent>

        {/* ---------------- PROTOCOLS ---------------- */}
        <TabsContent value="protocols" className="mt-4">
          <XSystemProtocolsTab clientId={id!} />
        </TabsContent>


        {/* ---------------- AUDIO ---------------- */}
        <TabsContent value="audio" className="mt-4 space-y-2">
          {audio.length === 0 && <EmptyState label="אין הקלטות משויכות." />}
          {audio.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Headphones className="h-4 w-4" /> {a.frequency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    הוקצה: {new Date(a.assigned_at).toLocaleDateString('he-IL')} · נוגן{' '}
                    {a.play_count}×
                  </div>
                </div>
                <Badge variant="outline">{a.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ---------------- CHECK-INS ---------------- */}
        <TabsContent value="checkins" className="mt-4 space-y-2">
          {checkins.length === 0 && <EmptyState label="עוד אין צ׳ק-אינים." />}
          {checkins.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {c.kind} {c.mood ? `· ${c.mood}/10` : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.submitted_at).toLocaleString('he-IL')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ---------------- PAYMENTS ---------------- */}
        <TabsContent value="payments" className="mt-4 space-y-2">
          {payments.length === 0 && <EmptyState label="אין תשלומים." />}
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {formatMoney(p.amount_cents, p.currency)} · {p.kind}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString('he-IL') : 'ממתין'}
                  </div>
                </div>
                <Badge variant="outline">{p.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ---------------- TIMELINE ---------------- */}
        <TabsContent value="timeline" className="mt-4">
          <EmptyState label="ציר הזמן ייבנה בשלב הבא — יאחד סשנים, צ׳ק-אינים, תשלומים ופולואפים." />
          {followups.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> פולואפים אחרונים
              </div>
              {followups.slice(0, 5).map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="text-sm">{f.title}</div>
                    <Badge variant="outline">{f.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
