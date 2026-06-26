/**
 * Exire Dashboard — practitioner-level "Today" view inside Admin Hub → Coach.
 *
 * Aggregates revenue, leads, clients, sessions and the action queue from
 * the existing xsystem_* tables and the leads table.
 */
import { useNavigate } from 'react-router-dom';
import {
  Calendar, CreditCard, Users, AlertCircle, ClipboardCheck, FileText,
  TrendingUp, Clock, ChevronLeft, ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useExireDashboard } from '@/hooks/xsystem/dashboard';
import { useOnboardingInsights } from '@/hooks/xsystem/onboardingInsights';
import { useExireFunnelMetrics } from '@/hooks/xsystem/exireFunnel';
import { useExireFormMetrics } from '@/hooks/xsystem/leadFormSync';
import { useResubmittedLeads } from '@/hooks/xsystem/resubmittedLeads';
import ExireLaunchChecklist from './ExireLaunchChecklist';
import {
  MobileAdminScreen, MobileAdminHeader, MobileMetricSummary,
  MobileSectionCard, MobileListItem, MobileEmptyState,
} from '@/components/admin/mobile';

const fmt = (cents: number, ccy: string) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: ccy || 'ILS', maximumFractionDigits: 0 })
    .format((cents || 0) / 100);

function Stat({
  label, value, hint, icon: Icon, tone = 'default',
}: {
  label: string; value: React.ReactNode; hint?: string; icon: any;
  tone?: 'default' | 'warn' | 'good';
}) {
  const toneClass =
    tone === 'warn' ? 'border-amber-500/30 bg-amber-500/5'
    : tone === 'good' ? 'border-emerald-500/30 bg-emerald-500/5'
    : 'border-border/50';
  return (
    <Card className={toneClass}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-muted-foreground truncate">{label}</div>
            <div className="text-lg font-semibold leading-tight">{value}</div>
            {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Renders as <details> on mobile (collapsed), inline section on desktop. */
function MobileCollapsible({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <>
      <details open={defaultOpen} className="md:hidden group rounded-2xl border border-border/50 bg-card/40 [&_summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium flex items-center justify-between">
          <span className="truncate">{title}</span>
          <ChevronLeft className="h-4 w-4 opacity-60 shrink-0 transition-transform group-open:-rotate-90" />
        </summary>
        <div className="px-3 pb-3">{children}</div>
      </details>
      <section className="hidden md:block">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {children}
      </section>
    </>
  );
}



export default function ExireDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useExireDashboard();
  const { data: insights } = useOnboardingInsights();
  const { data: funnel } = useExireFunnelMetrics();
  const { data: formMetrics } = useExireFormMetrics();
  const { data: resub } = useResubmittedLeads();

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const { revenue, leads, clients, sessions, actions } = data;

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">

      {/* MOBILE HERO — primary daily summary */}
      <section className="md:hidden">
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="p-4 space-y-3">
            <div>
              <div className="text-[11px] text-muted-foreground">הכנסות היום</div>
              <div className="text-3xl font-bold leading-tight">{fmt(revenue.todayCents, revenue.currency)}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                החודש: {fmt(revenue.monthCents, revenue.currency)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
              <div className="text-center">
                <div className="text-lg font-semibold">{sessions.today}</div>
                <div className="text-[10px] text-muted-foreground">סשנים היום</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-500">{actions.overdueFollowups}</div>
                <div className="text-[10px] text-muted-foreground">באיחור</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-teal-500">{leads.needFollowup}</div>
                <div className="text-[10px] text-muted-foreground">לידים פתוחים</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Revenue — full grid (desktop default; collapsed on mobile) */}
      <section className="hidden md:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">הכנסות</h3>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
          <Stat label="היום" value={fmt(revenue.todayCents, revenue.currency)} icon={TrendingUp} tone="good" />
          <Stat label="החודש" value={fmt(revenue.monthCents, revenue.currency)} icon={CreditCard} tone="good" />
          <Stat label="ממתין" value={fmt(revenue.pendingCents, revenue.currency)} hint={`${revenue.pendingClientCount} לקוחות`} icon={Clock} tone="warn" />
          <Stat label="תשלומים שולמו" value={revenue.paidCount} icon={CreditCard} />
          <Stat label="לקוחות בחוב" value={revenue.pendingClientCount} icon={AlertCircle} tone={revenue.pendingClientCount > 0 ? 'warn' : 'default'} />
        </div>
      </section>

      {/* Leads */}
      <section className="hidden md:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">לידים</h3>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-6">
          <Stat label="חדשים" value={leads.new} icon={Users} />
          <Stat label="פעילים" value={leads.active} icon={Users} />
          <Stat label="ממתינים לפולואפ" value={leads.needFollowup} icon={AlertCircle} tone={leads.needFollowup > 0 ? 'warn' : 'default'} />
          <Stat label="הומרו" value={leads.converted} icon={Users} tone="good" />
          <Stat label="חזרו 🔁" value={resub?.total ?? 0} icon={AlertCircle} tone={(resub?.total ?? 0) > 0 ? 'warn' : 'default'} hint="הגשה כפולה — דורש מענה אישי" />
          <Stat label="סה״כ" value={leads.total} icon={Users} />
        </div>
      </section>

      {/* Clients */}
      <section className="hidden md:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">לקוחות</h3>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <Stat label="פעילים" value={clients.active} icon={Users} />
          <Stat label="חדשים החודש" value={clients.newThisMonth} icon={Users} tone="good" />
          <Stat label="עם סשן הבא" value={clients.withUpcomingSession} icon={Calendar} />
          <Stat label="ללא סשן הבא" value={clients.withoutNextSession} icon={AlertCircle} tone={clients.withoutNextSession > 0 ? 'warn' : 'default'} />
        </div>
      </section>

      {/* Sessions */}
      <section className="hidden md:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">סשנים</h3>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <Stat label="היום" value={sessions.today} icon={Calendar} tone={sessions.today > 0 ? 'good' : 'default'} />
          <Stat label="עתידיים" value={sessions.upcoming} icon={Calendar} />
          <Stat label="הושלמו החודש" value={sessions.completedThisMonth} icon={Calendar} tone="good" />
          <Stat label="בוטלו/לא הופיע" value={sessions.cancelledThisMonth} icon={AlertCircle} tone={sessions.cancelledThisMonth > 0 ? 'warn' : 'default'} />
        </div>
      </section>

      {/* Mobile: full KPI grid collapsible */}
      <details className="md:hidden group rounded-2xl border border-border/50 bg-card/40 [&_summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium flex items-center justify-between">
          <span>כל המדדים · הכנסות, לידים, לקוחות, סשנים</span>
          <ChevronLeft className="h-4 w-4 opacity-60 transition-transform group-open:-rotate-90" />
        </summary>
        <div className="px-3 pb-3 space-y-4">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">הכנסות</h4>
            <div className="grid gap-2 grid-cols-2">
              <Stat label="היום" value={fmt(revenue.todayCents, revenue.currency)} icon={TrendingUp} tone="good" />
              <Stat label="החודש" value={fmt(revenue.monthCents, revenue.currency)} icon={CreditCard} tone="good" />
              <Stat label="ממתין" value={fmt(revenue.pendingCents, revenue.currency)} icon={Clock} tone="warn" />
              <Stat label="לקוחות בחוב" value={revenue.pendingClientCount} icon={AlertCircle} tone={revenue.pendingClientCount > 0 ? 'warn' : 'default'} />
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">לידים</h4>
            <div className="grid gap-2 grid-cols-2">
              <Stat label="חדשים" value={leads.new} icon={Users} />
              <Stat label="פעילים" value={leads.active} icon={Users} />
              <Stat label="הומרו" value={leads.converted} icon={Users} tone="good" />
              <Stat label="חזרו 🔁" value={resub?.total ?? 0} icon={AlertCircle} tone={(resub?.total ?? 0) > 0 ? 'warn' : 'default'} />
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">לקוחות וסשנים</h4>
            <div className="grid gap-2 grid-cols-2">
              <Stat label="לקוחות פעילים" value={clients.active} icon={Users} />
              <Stat label="חדשים החודש" value={clients.newThisMonth} icon={Users} tone="good" />
              <Stat label="סשנים עתידיים" value={sessions.upcoming} icon={Calendar} />
              <Stat label="הושלמו החודש" value={sessions.completedThisMonth} icon={Calendar} tone="good" />
            </div>
          </div>
        </div>
      </details>

      {/* Action Queue */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">תור פעולות להיום</h3>
        <div className="hidden md:grid gap-2 grid-cols-2 md:grid-cols-4 mb-3">
          <Stat label="פולואפים באיחור" value={actions.overdueFollowups} icon={AlertCircle} tone={actions.overdueFollowups > 0 ? 'warn' : 'default'} />
          <Stat label="פולואפים להיום" value={actions.followupsDueToday} icon={FileText} />
          <Stat label="תשלומים ממתינים" value={actions.pendingPayments} icon={CreditCard} tone={actions.pendingPayments > 0 ? 'warn' : 'default'} />
          <Stat label="צ׳ק-אינים ממתינים" value={actions.pendingCheckins} icon={ClipboardCheck} tone={actions.pendingCheckins > 0 ? 'warn' : 'default'} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">סשנים קרובים</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              {sessions.upcomingList.length === 0 && (
                <p className="text-xs text-muted-foreground">אין סשנים מתוכננים.</p>
              )}
              {sessions.upcomingList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/clients/${s.client_id}`)}
                  className="w-full flex items-center justify-between text-sm hover:bg-muted/50 rounded px-2 py-1.5 transition"
                >
                  <span>{new Date(s.scheduled_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">פולואפים באיחור</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              {actions.overdueFollowupList.length === 0 && (
                <p className="text-xs text-muted-foreground">אין משימות באיחור.</p>
              )}
              {actions.overdueFollowupList.map((f) => (
                <button
                  key={f.id}
                  onClick={() => f.client_id && navigate(`/clients/${f.client_id}`)}
                  className="w-full text-right flex items-center justify-between gap-2 text-sm hover:bg-muted/50 rounded px-2 py-1.5 transition"
                >
                  <span className="truncate flex-1">{f.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {f.due_at ? new Date(f.due_at).toLocaleDateString('he-IL') : '—'}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="py-3"><CardTitle className="text-sm">תשלומים ממתינים</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              {actions.pendingPaymentList.length === 0 && (
                <p className="text-xs text-muted-foreground">אין תשלומים ממתינים.</p>
              )}
              {actions.pendingPaymentList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/clients/${p.client_id}`)}
                  className="w-full flex items-center justify-between text-sm hover:bg-muted/50 rounded px-2 py-1.5 transition"
                >
                  <span>{fmt(p.amount_cents, p.currency)}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.due_at ? `יעד ${new Date(p.due_at).toLocaleDateString('he-IL')}` : '—'}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {insights && (
        <MobileCollapsible title="Onboarding · משימות פתוחות">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">לידים בהמתנה למענה</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.leadsAwaitingReply.length === 0
                  ? <p className="text-xs text-muted-foreground">אין לידים פתוחים.</p>
                  : insights.leadsAwaitingReply.map((l) => (
                    <button key={l.id} onClick={() => navigate('/admin?tab=coach&sub=leads')}
                      className="w-full text-right text-sm hover:bg-muted/50 rounded px-2 py-1 truncate">
                      {l.name} <span className="text-xs text-muted-foreground">· {new Date(l.created_at).toLocaleDateString('he-IL')}</span>
                    </button>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">לקוחות ללא סשן ראשון</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.clientsWithoutSession.length === 0
                  ? <p className="text-xs text-muted-foreground">כולם תוזמנו.</p>
                  : insights.clientsWithoutSession.map((c) => (
                    <button key={c.client_id} onClick={() => navigate(`/clients/${c.client_id}`)}
                      className="w-full text-right text-sm hover:bg-muted/50 rounded px-2 py-1 truncate">{c.full_name}</button>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">לקוחות ללא טופס קבלה</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.clientsWithoutIntake.length === 0
                  ? <p className="text-xs text-muted-foreground">כל הטפסים מצורפים.</p>
                  : insights.clientsWithoutIntake.map((c) => (
                    <button key={c.client_id} onClick={() => navigate(`/clients/${c.client_id}`)}
                      className="w-full text-right text-sm hover:bg-muted/50 rounded px-2 py-1 truncate">{c.full_name}</button>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">לקוחות ללא תשלום</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.clientsWithoutPayment.length === 0
                  ? <p className="text-xs text-muted-foreground">כולם שילמו.</p>
                  : insights.clientsWithoutPayment.map((c) => (
                    <button key={c.client_id} onClick={() => navigate(`/clients/${c.client_id}`)}
                      className="w-full text-right text-sm hover:bg-muted/50 rounded px-2 py-1 truncate">{c.full_name}</button>
                  ))}
              </CardContent>
            </Card>
          </div>
        </MobileCollapsible>
      )}

      {funnel && (
        <MobileCollapsible title="Exire Landing · משפך">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Exire Landing · משפך</h2>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="ghost" className="text-xs gap-1">
                <a href="/exire" target="_blank" rel="noopener noreferrer">פתח עמוד נחיתה<ChevronLeft className="h-3 w-3" /></a>
              </Button>
              <Button size="sm" variant="ghost" className="text-xs"
                onClick={() => navigate('/admin?tab=coach&sub=leads&source=exire_landing')}>
                לידים במשפך
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5 mb-3">
            <Stat label="לידים היום"      value={funnel.leadsToday}        icon={TrendingUp} tone={funnel.leadsToday > 0 ? 'good' : 'default'} />
            <Stat label="לידים החודש"     value={funnel.leadsThisMonth}    icon={Calendar} />
            <Stat label="ממתינים למענה"   value={funnel.awaitingFirstReply} icon={AlertCircle} tone={funnel.awaitingFirstReply > 0 ? 'warn' : 'default'} />
            <Stat label="ללא פולואפ"       value={funnel.withoutFollowup}   icon={ClipboardCheck} tone={funnel.withoutFollowup > 0 ? 'warn' : 'default'} />
            <Stat label="הומרו ללקוחות"   value={funnel.converted}         icon={Users} tone="good" />
          </div>
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">לידים אחרונים מהמשפך</CardTitle></CardHeader>
            <CardContent className="space-y-1 pt-0">
              {funnel.latest.length === 0 && (
                <p className="text-xs text-muted-foreground">עדיין אין לידים מעמוד הנחיתה.</p>
              )}
              {funnel.latest.map((l) => (
                <button key={l.id}
                  onClick={() => navigate('/admin?tab=coach&sub=leads&source=exire_landing')}
                  className="w-full flex items-center justify-between gap-3 text-sm hover:bg-muted/50 rounded px-2 py-1.5 text-right">
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{l.name}</span>
                    {l.pain_category && <span className="text-xs text-muted-foreground mr-2">· {l.pain_category}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(l.created_at).toLocaleDateString('he-IL')}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </MobileCollapsible>
      )}

      {formMetrics && formMetrics.formIds.length > 0 && (
        <MobileCollapsible title="Exire · טפסי לידים">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Exire · טפסי לידים</h2>
            <Button size="sm" variant="ghost" className="text-xs"
              onClick={() => navigate('/admin?tab=coach&sub=exire-lead-forms')}>
              נהל מיפויי טפסים
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5 mb-3">
            <Stat label="לידים מטפסים היום" value={formMetrics.leadsToday} icon={TrendingUp} tone={formMetrics.leadsToday > 0 ? 'good' : 'default'} />
            <Stat label="ממתינים למענה ראשון" value={formMetrics.awaitingFirstReply} icon={AlertCircle} tone={formMetrics.awaitingFirstReply > 0 ? 'warn' : 'default'} />
            <Stat label="הגשות לא מסונכרנות" value={formMetrics.totalUnsynced} icon={ClipboardCheck} tone={formMetrics.totalUnsynced > 0 ? 'warn' : 'default'} />
            <Stat label="סך הגשות" value={formMetrics.totalSubmissions} icon={FileText} />
            <Stat label="סך סונכרנו" value={formMetrics.totalSynced} icon={Users} tone="good" />
          </div>
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">לידים אחרונים מטפסים</CardTitle></CardHeader>
            <CardContent className="space-y-1 pt-0">
              {formMetrics.latest.length === 0 && (
                <p className="text-xs text-muted-foreground">עוד לא נוצרו לידים מטפסים מסומנים.</p>
              )}
              {formMetrics.latest.map((l) => (
                <button key={l.id}
                  onClick={() => navigate(`/admin?tab=coach&sub=leads&source=${encodeURIComponent(l.source)}`)}
                  className="w-full flex items-center justify-between gap-3 text-sm hover:bg-muted/50 rounded px-2 py-1.5 text-right">
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{l.name}</span>
                    {l.pain_category && <span className="text-xs text-muted-foreground mr-2">· {l.pain_category}</span>}
                    {l.form_title && <span className="text-[10px] text-muted-foreground mr-2">[{l.form_title}]</span>}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(l.created_at).toLocaleDateString('he-IL')}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </MobileCollapsible>
      )}

      {/* Launch readiness — setup support, collapsed by default on mobile */}
      <details className="group rounded-2xl border border-border/50 bg-card/40 [&_summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>הכנה להשקה · רשימת בדיקות</span>
          <span className="text-xs opacity-60 group-open:hidden">הצג</span>
          <span className="text-xs opacity-60 hidden group-open:inline">הסתר</span>
        </summary>
        <div className="px-3 pb-3">
          <ExireLaunchChecklist />
        </div>
      </details>
    </div>
  );
}


