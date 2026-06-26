/**
 * XSYSTEM Client Detail.
 * Desktop: 13-tab horizontal layout (unchanged).
 * Mobile (Phase IA-2): grouped section home + bottom-sheet picker,
 *   no horizontal tab strip.
 */
import { useState, useMemo, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Mail, Phone, MessageCircle, AtSign, Calendar, Brain, Repeat,
  Users, DoorOpen, ClipboardCheck, CreditCard, FileText, Plus, Headphones,
  ChevronLeft, ChevronRight, LayoutGrid, ListChecks, Briefcase, History, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useClient, useClientProfile } from '@/hooks/useClients';
import {
  useXSystemSessionsCount,
  useXSystemNextSession,
  useXSystemActiveBeliefsCount,
  useXSystemPatternsCount,
  useXSystemInnerPartsCount,
  useXSystemClientRoomsCount,
  useXSystemAudioAssignments,
  useXSystemAudioAssignmentsCount,
  useXSystemCheckinsCount,
  useXSystemPaymentsCount,
  useXSystemPaymentsTotal,
  useXSystemClientPendingPayments,
  useXSystemOpenFollowupsCount,
  useXSystemNextFollowup,
  useXSystemLastCheckin,
} from '@/hooks/xsystem';
import XSystemSessionsTab from '@/components/admin/clients/xsystem/XSystemSessionsTab';
import XSystemBeliefsTab from '@/components/admin/clients/xsystem/XSystemBeliefsTab';
import XSystemPatternsTab from '@/components/admin/clients/xsystem/XSystemPatternsTab';
import XSystemInnerPartsTab from '@/components/admin/clients/xsystem/XSystemInnerPartsTab';
import XSystemRoomsTab from '@/components/admin/clients/xsystem/XSystemRoomsTab';
import XSystemProtocolsTab from '@/components/admin/clients/xsystem/XSystemProtocolsTab';
import XSystemAudioTab from '@/components/admin/clients/xsystem/XSystemAudioTab';
import XSystemCheckinsTab from '@/components/admin/clients/xsystem/XSystemCheckinsTab';
import XSystemPaymentsTab from '@/components/admin/clients/xsystem/XSystemPaymentsTab';
import XSystemFollowupsTab from '@/components/admin/clients/xsystem/XSystemFollowupsTab';
import XSystemTimelineTab from '@/components/admin/clients/xsystem/XSystemTimelineTab';
import XSystemIntakeTab from '@/components/admin/clients/xsystem/XSystemIntakeTab';
import WhatsAppQuickActions from '@/components/admin/clients/xsystem/WhatsAppQuickActions';
import OnboardingChecklist from '@/components/admin/clients/xsystem/OnboardingChecklist';
import { useDefaultIntakeForm } from '@/hooks/xsystem/forms';
import { useClientFormSubmissions } from '@/hooks/xsystem';

const CLIENTS_PATH = '/admin-hub?tab=coach&sub=xsystem-clients';

function StatCard({
  icon: Icon, label, value, hint,
}: { icon: any; label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4" /></div>
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

const fmtMoney = (cents: number, ccy: string) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: ccy || 'ILS' }).format((cents || 0) / 100);

type MobileSectionId = 'home' | 'overview' | 'sessions' | 'inner' | 'tasks' | 'payments' | 'history';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: client, isLoading } = useClient(id);
  const { data: profile } = useClientProfile(id);

  const { data: sessionsCount = 0 } = useXSystemSessionsCount(id);
  const { data: nextSession } = useXSystemNextSession(id);
  const { data: activeBeliefs = 0 } = useXSystemActiveBeliefsCount(id);
  const { data: patternsCount = 0 } = useXSystemPatternsCount(id);
  const { data: partsCount = 0 } = useXSystemInnerPartsCount(id);
  const { data: clientRoomsCount = 0 } = useXSystemClientRoomsCount(id);
  const { data: audioCount = 0 } = useXSystemAudioAssignmentsCount(id);
  const { data: audioList = [] } = useXSystemAudioAssignments(id);
  const { data: checkinsCount = 0 } = useXSystemCheckinsCount(id);
  const { data: lastCheckin } = useXSystemLastCheckin(id);
  const { data: openFollowups = 0 } = useXSystemOpenFollowupsCount(id);
  const { data: nextFollowup } = useXSystemNextFollowup(id);
  const { data: paymentsCount = 0 } = useXSystemPaymentsCount(id);
  const { data: paymentsTotal } = useXSystemPaymentsTotal(id);
  const { data: paymentsPending } = useXSystemClientPendingPayments(id);
  const { data: intakeForm } = useDefaultIntakeForm();
  const { data: clientSubmissions = [] } = useClientFormSubmissions(id);

  const [mobileSection, setMobileSection] = useState<MobileSectionId>('home');
  const [pickerOpen, setPickerOpen] = useState(false);

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
        <Button variant="ghost" onClick={() => navigate(CLIENTS_PATH)} className="gap-2 mb-4">
          <ArrowRight className="h-4 w-4" /> חזרה
        </Button>
        <Card><CardContent className="py-12 text-center text-muted-foreground">לקוח לא נמצא</CardContent></Card>
      </div>
    );
  }

  const goals = (profile?.goals as unknown[]) || [];
  const issues = (profile?.presenting_issues as unknown[]) || [];
  const lastAudio = audioList[0];
  const waNumber = (client.whatsapp || client.phone || '').replace(/\D/g, '');

  // ---- Section content blocks (shared by desktop tabs + mobile groups) ----

  const overviewBlock = (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        <StatCard icon={Calendar} label="סשנים" value={sessionsCount} />
        <StatCard icon={Brain} label="אמונות פעילות" value={activeBeliefs} />
        <StatCard icon={Repeat} label="תבניות פעילות" value={patternsCount} />
        <StatCard icon={Users} label="חלקים פנימיים" value={partsCount} />
        <StatCard icon={DoorOpen} label="חדרים פעילים" value={clientRoomsCount} />
        <StatCard icon={ClipboardCheck} label="צ׳ק-אינים" value={checkinsCount} />
        <StatCard icon={FileText} label="פולואפים פתוחים" value={openFollowups} />
        <StatCard icon={CreditCard} label="סך שולם"
          value={fmtMoney(paymentsTotal?.totalCents || 0, paymentsTotal?.currency || 'ILS')}
          hint={`${paymentsTotal?.count || 0} תשלומים`} />
        <StatCard icon={CreditCard} label="תשלום ממתין"
          value={fmtMoney(paymentsPending?.totalCents || 0, paymentsPending?.currency || 'ILS')}
          hint={paymentsPending?.count ? `${paymentsPending.count} תשלומים` : 'אין חוב פתוח'} />
        <StatCard icon={Calendar} label="סשן הבא"
          value={nextSession?.scheduled_at ? new Date(nextSession.scheduled_at).toLocaleDateString('he-IL') : '—'}
          hint={nextSession?.scheduled_at
            ? new Date(nextSession.scheduled_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
            : 'לא נקבע'} />
        <StatCard icon={FileText} label="פולואפ הבא"
          value={nextFollowup?.title || '—'}
          hint={nextFollowup?.due_at ? new Date(nextFollowup.due_at).toLocaleDateString('he-IL') : ''} />
        <StatCard icon={ClipboardCheck} label="צ׳ק-אין אחרון"
          value={lastCheckin ? new Date(lastCheckin.submitted_at).toLocaleDateString('he-IL') : '—'}
          hint={lastCheckin ? (typeof lastCheckin.mood === 'number' ? `מצב רוח ${lastCheckin.mood}/10` : lastCheckin.kind) : ''} />
        <StatCard icon={Headphones} label="הקלטה אחרונה"
          value={lastAudio ? lastAudio.frequency : '—'}
          hint={lastAudio ? new Date(lastAudio.assigned_at).toLocaleDateString('he-IL') : ''} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <OnboardingChecklist
          contactInfoOk={!!(client.phone || client.whatsapp || client.email)}
          hasIntake={clientSubmissions.length > 0}
          hasFirstSession={sessionsCount > 0 || !!nextSession}
          hasPayment={paymentsCount > 0}
          hasAudio={audioCount > 0}
        />
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-base">פעולות מהירות</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            {waNumber && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> WhatsApp ישיר
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">תבניות WhatsApp / אימייל</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <WhatsAppQuickActions client={client} intakeLink={intakeForm?.url} />
        </CardContent>
      </Card>

      {client.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">הערות</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{client.notes}</p></CardContent>
        </Card>
      )}

      {(goals.length > 0 || issues.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {goals.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">מטרות</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pr-5 space-y-1 text-sm">
                  {goals.map((g, i) => <li key={i}>{typeof g === 'string' ? g : JSON.stringify(g)}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
          {issues.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">סוגיות מרכזיות</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pr-5 space-y-1 text-sm">
                  {issues.map((g, i) => <li key={i}>{typeof g === 'string' ? g : JSON.stringify(g)}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const intakeBlock = <XSystemIntakeTab clientId={id!} subconsciousSummary={profile?.subconscious_summary || null} />;

  // ---- Mobile section groups ----

  const MOBILE_SECTIONS: Array<{
    id: Exclude<MobileSectionId, 'home'>;
    title: string;
    subtitle: string;
    icon: any;
    indicator?: ReactNode;
  }> = [
    { id: 'overview', title: 'סקירה', subtitle: 'נתונים, אונבורדינג, אינטייק', icon: LayoutGrid },
    { id: 'sessions', title: 'סשנים', subtitle: 'פגישות, הערות, פרוטוקולים', icon: Calendar, indicator: sessionsCount || undefined },
    { id: 'inner', title: 'עבודה פנימית', subtitle: 'אמונות · תבניות · חלקים · חדרים', icon: Brain, indicator: (activeBeliefs + patternsCount + partsCount + clientRoomsCount) || undefined },
    { id: 'tasks', title: 'משימות ואינטגרציה', subtitle: 'הקלטות · צ׳ק-אינים · פולואפים', icon: ListChecks, indicator: (audioCount + openFollowups) || undefined },
    { id: 'payments', title: 'תשלומים', subtitle: 'חיובים, סטטוס, סך שולם', icon: Briefcase, indicator: paymentsCount || undefined },
    { id: 'history', title: 'היסטוריה', subtitle: 'ציר זמן מלא', icon: History },
  ];

  const currentMobileSection = useMemo(
    () => MOBILE_SECTIONS.find(s => s.id === mobileSection),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mobileSection, sessionsCount, activeBeliefs, patternsCount, partsCount, clientRoomsCount, audioCount, openFollowups, paymentsCount],
  );

  const renderMobileSectionContent = (sec: MobileSectionId): ReactNode => {
    switch (sec) {
      case 'overview':
        return (
          <div className="space-y-6">
            {overviewBlock}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">אינטייק</h3>
              {intakeBlock}
            </div>
          </div>
        );
      case 'sessions':
        return (
          <div className="space-y-6">
            <XSystemSessionsTab clientId={id!} />
          </div>
        );
      case 'inner':
        return (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">אמונות</h3>
              <XSystemBeliefsTab clientId={id!} />
            </section>
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">תבניות</h3>
              <XSystemPatternsTab clientId={id!} />
            </section>
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">חלקים פנימיים</h3>
              <XSystemInnerPartsTab clientId={id!} />
            </section>
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">חדרים</h3>
              <XSystemRoomsTab clientId={id!} />
            </section>
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">פרוטוקולים</h3>
              <XSystemProtocolsTab clientId={id!} />
            </section>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">הקלטות</h3>
              <XSystemAudioTab clientId={id!} />
            </section>
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">צ׳ק-אינים</h3>
              <XSystemCheckinsTab clientId={id!} />
            </section>
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">פולואפים</h3>
              <XSystemFollowupsTab clientId={id!} />
            </section>
          </div>
        );
      case 'payments':
        return <XSystemPaymentsTab clientId={id!} />;
      case 'history':
        return <XSystemTimelineTab clientId={id!} />;
      default:
        return null;
    }
  };

  const SectionPicker = (
    <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutGrid className="h-4 w-4" /> בחר אזור
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader><SheetTitle className="text-right">אזורי הלקוח</SheetTitle></SheetHeader>
        <div className="grid gap-2 mt-4">
          {MOBILE_SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = s.id === mobileSection;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { setMobileSection(s.id); setPickerOpen(false); }}
                className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${active ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/50'}`}
              >
                <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span className="truncate">{s.title}</span>
                    {s.indicator ? <Badge variant="secondary" className="text-[10px]">{s.indicator}</Badge> : null}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{s.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );

  // ---- Mobile header (compact) ----
  const mobileHeader = (
    <Card className="border-border/50">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold truncate">{client.full_name}</h1>
              <Badge variant="outline" className="text-[10px]">{client.status}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {nextSession?.scheduled_at
                ? `סשן הבא: ${new Date(nextSession.scheduled_at).toLocaleDateString('he-IL')} ${new Date(nextSession.scheduled_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                : nextFollowup?.title
                  ? `פולואפ: ${nextFollowup.title}`
                  : `לקוח/ה מאז ${new Date(client.created_at).toLocaleDateString('he-IL')}`}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {client.phone && (
                <DropdownMenuItem asChild>
                  <a href={`tel:${client.phone}`} dir="ltr"><Phone className="h-3.5 w-3.5 me-2" />{client.phone}</a>
                </DropdownMenuItem>
              )}
              {client.email && (
                <DropdownMenuItem asChild>
                  <a href={`mailto:${client.email}`}><Mail className="h-3.5 w-3.5 me-2" />אימייל</a>
                </DropdownMenuItem>
              )}
              {client.instagram_handle && (
                <DropdownMenuItem asChild>
                  <a href={`https://instagram.com/${client.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    <AtSign className="h-3.5 w-3.5 me-2" />{client.instagram_handle}
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {waNumber && (
          <Button asChild size="sm" className="w-full gap-2">
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> שלח הודעה ב-WhatsApp
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // ---- Mobile rendering ----
  if (isMobile) {
    return (
      <div className="container max-w-2xl mx-auto p-3 space-y-3 overflow-x-hidden">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(CLIENTS_PATH)} className="gap-1 px-2">
            <ChevronRight className="h-4 w-4" /> חזרה למתאמנים
          </Button>
          {mobileSection !== 'home' && SectionPicker}
        </div>

        {mobileHeader}

        {mobileSection === 'home' ? (
          <div className="grid gap-2">
            {MOBILE_SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setMobileSection(s.id)}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-right transition active:scale-[0.99] hover:bg-muted/40"
                >
                  <div className="rounded-xl bg-muted p-2.5"><Icon className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold truncate">{s.title}</div>
                      {s.indicator ? <Badge variant="secondary" className="text-[10px]">{s.indicator}</Badge> : null}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{s.subtitle}</div>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 sticky top-0 z-10 -mx-3 px-3 py-2 bg-background/85 backdrop-blur-md border-b border-border/40">
              <Button variant="ghost" size="sm" onClick={() => setMobileSection('home')} className="gap-1 px-2">
                <ChevronRight className="h-4 w-4" /> כל האזורים
              </Button>
              <div className="text-sm font-semibold truncate">{currentMobileSection?.title}</div>
            </div>
            {renderMobileSectionContent(mobileSection)}
          </div>
        )}
      </div>
    );
  }

  // ---- Desktop rendering (unchanged behaviour) ----
  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-4">
      <Button variant="ghost" onClick={() => navigate(CLIENTS_PATH)} className="gap-2">
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
                {client.lead_id && ' · מקור: ליד'}
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
            {waNumber && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
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
                <a href={`https://instagram.com/${client.instagram_handle.replace('@', '')}`}
                   target="_blank" rel="noopener noreferrer">
                  <AtSign className="h-4 w-4" />{client.instagram_handle}
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
          <TabsTrigger value="followups">פולואפים ({openFollowups})</TabsTrigger>
          <TabsTrigger value="payments">תשלומים ({paymentsCount})</TabsTrigger>
          <TabsTrigger value="timeline">ציר זמן</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="space-y-4">
            {overviewBlock}
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">קיצורי דרך</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                <Button size="sm" variant="outline" className="gap-2"
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-state][value="sessions"]')?.click()}>
                  <Plus className="h-4 w-4" /> סשן חדש
                </Button>
                <Button size="sm" variant="outline" className="gap-2"
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-state][value="followups"]')?.click()}>
                  <Plus className="h-4 w-4" /> פולואפ
                </Button>
                <Button size="sm" variant="outline" className="gap-2"
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-state][value="payments"]')?.click()}>
                  <Plus className="h-4 w-4" /> תשלום
                </Button>
                <Button size="sm" variant="outline" className="gap-2"
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-state][value="checkins"]')?.click()}>
                  <Plus className="h-4 w-4" /> צ׳ק-אין
                </Button>
                <Button size="sm" variant="outline" className="gap-2"
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-state][value="audio"]')?.click()}>
                  <Plus className="h-4 w-4" /> שייך הקלטה
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intake" className="mt-4">{intakeBlock}</TabsContent>
        <TabsContent value="sessions" className="mt-4"><XSystemSessionsTab clientId={id!} /></TabsContent>
        <TabsContent value="beliefs" className="mt-4"><XSystemBeliefsTab clientId={id!} /></TabsContent>
        <TabsContent value="patterns" className="mt-4"><XSystemPatternsTab clientId={id!} /></TabsContent>
        <TabsContent value="parts" className="mt-4"><XSystemInnerPartsTab clientId={id!} /></TabsContent>
        <TabsContent value="rooms" className="mt-4"><XSystemRoomsTab clientId={id!} /></TabsContent>
        <TabsContent value="protocols" className="mt-4"><XSystemProtocolsTab clientId={id!} /></TabsContent>
        <TabsContent value="audio" className="mt-4"><XSystemAudioTab clientId={id!} /></TabsContent>
        <TabsContent value="checkins" className="mt-4"><XSystemCheckinsTab clientId={id!} /></TabsContent>
        <TabsContent value="followups" className="mt-4"><XSystemFollowupsTab clientId={id!} /></TabsContent>
        <TabsContent value="payments" className="mt-4"><XSystemPaymentsTab clientId={id!} /></TabsContent>
        <TabsContent value="timeline" className="mt-4"><XSystemTimelineTab clientId={id!} /></TabsContent>
      </Tabs>
    </div>
  );
}
