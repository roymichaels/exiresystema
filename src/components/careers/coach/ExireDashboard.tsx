/**
 * Exire Dashboard — practitioner-level "Today" view inside Admin Hub → Coach.
 *
 * Aggregates revenue, leads, clients, sessions and the action queue from
 * the existing xsystem_* tables and the leads table.
 */
import { useNavigate } from 'react-router-dom';
import {
  Calendar, CreditCard, Users, AlertCircle, ClipboardCheck, FileText,
  TrendingUp, Clock, ChevronLeft, ExternalLink, MessageCircle, Phone,
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
import { useLeads } from '@/hooks/useLeads';
import ExireLaunchChecklist from './ExireLaunchChecklist';
import AdvisorCard from '@/components/admin/advisor/AdvisorCard';
import {
  MobileAdminScreen, MobileAdminHeader, MobileMetricSummary,
  MobileSectionCard, MobileListItem, MobileEmptyState,
} from '@/components/admin/mobile';
import { useTranslation } from '@/hooks/useTranslation';

function Stat({
  label, value, hint, icon: Icon, tone = 'default',
}: {
  label: string; value: React.ReactNode; hint?: string; icon: any;
  tone?: 'default' | 'warn' | 'good' | 'info';
}) {
  const TONE_STYLES: Record<string,string> = {
    warn: 'border-amber-500/30 bg-amber-500/8',
    good: 'border-emerald-500/30 bg-emerald-500/8',
    info: 'border-cyan-500/30 bg-cyan-500/8',
    default: 'border-border/40 bg-card/60',
  };
  const toneClass = TONE_STYLES[tone];
  return (
    <Card className={cn(toneClass, 'transition-all hover:border-primary/40 hover:-translate-y-0.5')}>
      <CardContent className="p-2.5 md:p-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'rounded-md p-1.5',
            tone === 'warn' ? 'bg-amber-500/15 text-amber-500' :
            tone === 'good' ? 'bg-emerald-500/15 text-emerald-500' :
            tone === 'info' ? 'bg-cyan-500/15 text-cyan-400' :
            'bg-muted/50 text-muted-foreground/70',
          )}>
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] md:text-[11px] text-muted-foreground truncate">{label}</div>
            <div className="text-base md:text-lg font-semibold leading-tight">{value}</div>
            {hint && <div className="text-[10px] text-muted-foreground/80 truncate">{hint}</div>}
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
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useExireDashboard();
  const { data: insights } = useOnboardingInsights();
  const { data: funnel } = useExireFunnelMetrics();
  const { data: formMetrics } = useExireFormMetrics();
  const { data: resub } = useResubmittedLeads();
  const { data: allLeads = [] } = useLeads();

  const locale = language === 'he' ? 'he-IL' : language === 'es' ? 'es-ES' : 'en-US';

  const SOURCE_LABEL: Record<string, string> = {
    exire_landing: language === 'he' ? 'דף נחיתה' : language === 'es' ? 'Página de aterrizaje' : 'Landing page',
    exire_form: language === 'he' ? 'טופס Exire' : language === 'es' ? 'Formulario Exire' : 'Exire form',
    exire_instagram_form: language === 'he' ? 'אינסטגרם' : language === 'es' ? 'Instagram' : 'Instagram',
    homepage: language === 'he' ? 'דף הבית' : language === 'es' ? 'Página principal' : 'Homepage',
  };
  const fmtSource = (s: string | null) => SOURCE_LABEL[s || ''] || s || (language === 'he' ? 'מקור לא ידוע' : language === 'es' ? 'Fuente desconocida' : 'Unknown source');

  const fmt = (cents: number, ccy: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: ccy || 'ILS', maximumFractionDigits: 0 })
      .format((cents || 0) / 100);

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
    <div className="space-y-4 w-full max-w-[1120px] mx-auto overflow-x-hidden">

      {/* ============================ MOBILE ============================ */}
      <MobileAdminScreen>
        <MobileAdminHeader
          title={language === 'he' ? 'היום' : language === 'es' ? 'Hoy' : 'Today'}
          subtitle={`${new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}`}
        />

        {/* 1. Daily summary — one compact card */}
        <MobileMetricSummary
          hero={{
            label: language === 'he' ? 'הכנסות היום' : language === 'es' ? 'Ingresos de hoy' : 'Today revenue',
            value: fmt(revenue.todayCents, revenue.currency),
            hint: `${language === 'he' ? 'החודש' : language === 'es' ? 'Este mes' : 'This month'}: ${fmt(revenue.monthCents, revenue.currency)}`,
          }}
          metrics={[
            { label: language === 'he' ? 'סשנים' : language === 'es' ? 'Sesiones' : 'Sessions', value: sessions.today },
            { label: language === 'he' ? 'באיחור' : language === 'es' ? 'Vencidos' : 'Overdue', value: actions.overdueFollowups, tone: actions.overdueFollowups > 0 ? 'warn' : 'default' },
            { label: language === 'he' ? 'לידים פתוחים' : language === 'es' ? 'Leads abiertos' : 'Open leads', value: leads.needFollowup, tone: leads.needFollowup > 0 ? 'warn' : 'default' },
          ]}
        />

        {/* 2. New leads / requires attention */}
        {(() => {
          const freshLeads = allLeads
            .filter(l => l.status === 'new' || l.status === 'contacted')
            .slice(0, 5);
          if (freshLeads.length === 0) return null;
          return (
            <MobileSectionCard title={language === 'he' ? 'דורשים תגובה' : language === 'es' ? 'Requieren respuesta' : 'Needs response'} flush>
              <div className="divide-y divide-border/30">
                {freshLeads.map((l) => {
                  const wa = l.phone ? `https://wa.me/${l.phone.replace(/[^\d+]/g, '').replace(/^0/, '+972').replace(/^\+/, '')}` : null;
                  return (
                    <div key={l.id} className="px-3.5 py-2.5 active:bg-muted/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-medium truncate">{l.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {fmtSource(l.source)}
                            <span className="mx-1">·</span>
                            {new Date(l.created_at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate('/admin-hub?tab=leads')}
                            className="text-[11px] font-medium text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            {language === 'he' ? 'פתח ליד' : language === 'es' ? 'Abrir lead' : 'Open lead'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </MobileSectionCard>
          );
        })()}

        {/* 3. Exire Advisor — quick access to the business brain */}
        <AdvisorCard />

        {/* 4. Compact status row */}
        <div className="flex gap-2">
          {[
            { label: language === 'he' ? 'סשנים' : language === 'es' ? 'Sesiones' : 'Sessions', value: sessions.upcoming, icon: Calendar },
            { label: language === 'he' ? 'פולואפים' : language === 'es' ? 'Seguimientos' : 'Follow-ups', value: actions.overdueFollowups, icon: ClipboardCheck, warn: actions.overdueFollowups > 0 },
            { label: language === 'he' ? 'תשלומים' : language === 'es' ? 'Pagos' : 'Payments', value: actions.pendingPayments, icon: CreditCard, warn: actions.pendingPayments > 0 },
          ].map(s => (
            <div
              key={s.label}
              className="flex-1 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm px-3 py-2.5 text-center"
            >
              <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.warn ? 'text-amber-500' : 'text-muted-foreground/60'}`} strokeWidth={1.5} />
              <div className={`text-base font-semibold leading-tight ${s.warn ? 'text-amber-500' : ''}`}>{s.value}</div>
              <div className="text-[9px] text-muted-foreground truncate mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 5. Detailed lists — only when there are actual items */}
        {sessions.upcomingList.length > 0 && (
          <MobileSectionCard title={sessions.upcomingList.length > 0 ? `${language === 'he' ? 'סשנים קרובים' : language === 'es' ? 'Próximas sesiones' : 'Upcoming sessions'} (${sessions.upcomingList.length})` : language === 'he' ? 'סשנים קרובים' : language === 'es' ? 'Próximas sesiones' : 'Upcoming sessions'} flush>
            <div className="divide-y divide-border/30">
              {sessions.upcomingList.map((s) => (
                <MobileListItem
                  key={s.id}
                  title={new Date(s.scheduled_at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
                  subtitle={language === 'he' ? 'פתח כרטיס לקוח' : language === 'es' ? 'Abrir tarjeta de cliente' : 'Open client card'}
                  trailing={<ChevronLeft className="h-4 w-4 text-muted-foreground/60" />}
                  onClick={() => navigate(`/clients/${s.client_id}`)}
                />
              ))}
            </div>
          </MobileSectionCard>
        )}

        {actions.overdueFollowupList.length > 0 && (
          <MobileSectionCard
            title={language === 'he' ? 'פולואפים באיחור' : language === 'es' ? 'Seguimientos vencidos' : 'Overdue follow-ups'}
            hint={`${actions.overdueFollowups} ${language === 'he' ? 'משימות דורשות מענה' : language === 'es' ? 'tareas requieren respuesta' : 'tasks require response'}`}
            flush
          >
            <div className="divide-y divide-border/30">
              {actions.overdueFollowupList.map((f) => (
                <MobileListItem
                  key={f.id}
                  title={f.title}
                  meta={f.due_at ? new Date(f.due_at).toLocaleDateString(locale) : undefined}
                  onClick={() => f.client_id && navigate(`/clients/${f.client_id}`)}
                />
              ))}
            </div>
          </MobileSectionCard>
        )}

        {actions.pendingPaymentList.length > 0 && (
          <MobileSectionCard title={`${language === 'he' ? 'תשלומים ממתינים' : language === 'es' ? 'Pagos pendientes' : 'Pending payments'} (${actions.pendingPayments})`} flush>
            <div className="divide-y divide-border/30">
              {actions.pendingPaymentList.map((p) => (
                <MobileListItem
                  key={p.id}
                  title={fmt(p.amount_cents, p.currency)}
                  subtitle={p.due_at ? `${language === 'he' ? 'יעד' : language === 'es' ? 'Fecha' : 'Due'} ${new Date(p.due_at).toLocaleDateString(locale)}` : '—'}
                  onClick={() => navigate(`/clients/${p.client_id}`)}
                />
              ))}
            </div>
          </MobileSectionCard>
        )}

        {/* All metrics — folded deeper */}
        <details className="group rounded-2xl border border-border/40 bg-card/40 [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-medium flex items-center justify-between min-h-[44px]">
            <span>{language === 'he' ? 'כל המדדים · הכנסות, לידים, לקוחות, סשנים' : language === 'es' ? 'Todas las métricas · Ingresos, leads, clientes, sesiones' : 'All metrics · Revenue, leads, clients, sessions'}</span>
            <ChevronLeft className="h-4 w-4 opacity-60 transition-transform group-open:-rotate-90" />
          </summary>
          <div className="px-3 pb-3 space-y-3">
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{language === 'he' ? 'הכנסות' : language === 'es' ? 'Ingresos' : 'Revenue'}</h4>
              <div className="grid gap-2 grid-cols-2">
                <Stat label={language === 'he' ? 'היום' : language === 'es' ? 'Hoy' : 'Today'} value={fmt(revenue.todayCents, revenue.currency)} icon={TrendingUp} tone="good" />
                <Stat label={language === 'he' ? 'החודש' : language === 'es' ? 'Este mes' : 'This month'} value={fmt(revenue.monthCents, revenue.currency)} icon={CreditCard} tone="good" />
                <Stat label={language === 'he' ? 'ממתין' : language === 'es' ? 'Pendiente' : 'Pending'} value={fmt(revenue.pendingCents, revenue.currency)} icon={Clock} tone="warn" />
                <Stat label={language === 'he' ? 'לקוחות בחוב' : language === 'es' ? 'Clientes en deuda' : 'Clients in debt'} value={revenue.pendingClientCount} icon={AlertCircle} tone={revenue.pendingClientCount > 0 ? 'warn' : 'default'} />
              </div>
            </div>
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{language === 'he' ? 'לידים' : language === 'es' ? 'Leads' : 'Leads'}</h4>
              <div className="grid gap-2 grid-cols-2">
                <Stat label={language === 'he' ? 'חדשים' : language === 'es' ? 'Nuevos' : 'New'} value={leads.new} icon={Users} />
                <Stat label={language === 'he' ? 'פעילים' : language === 'es' ? 'Activos' : 'Active'} value={leads.active} icon={Users} />
                <Stat label={language === 'he' ? 'הומרו' : language === 'es' ? 'Convertidos' : 'Converted'} value={leads.converted} icon={Users} tone="good" />
                <Stat label={language === 'he' ? 'חזרו 🔁' : language === 'es' ? 'Regresaron 🔁' : 'Returned 🔁'} value={resub?.total ?? 0} icon={AlertCircle} tone={(resub?.total ?? 0) > 0 ? 'warn' : 'default'} />
              </div>
            </div>
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{language === 'he' ? 'לקוחות וסשנים' : language === 'es' ? 'Clientes y sesiones' : 'Clients & Sessions'}</h4>
              <div className="grid gap-2 grid-cols-2">
                <Stat label={language === 'he' ? 'לקוחות פעילים' : language === 'es' ? 'Clientes activos' : 'Active clients'} value={clients.active} icon={Users} />
                <Stat label={language === 'he' ? 'חדשים החודש' : language === 'es' ? 'Nuevos este mes' : 'New this month'} value={clients.newThisMonth} icon={Users} tone="good" />
                <Stat label={language === 'he' ? 'סשנים עתידיים' : language === 'es' ? 'Sesiones futuras' : 'Upcoming sessions'} value={sessions.upcoming} icon={Calendar} />
                <Stat label={language === 'he' ? 'הושלמו החודש' : language === 'es' ? 'Completadas este mes' : 'Completed this month'} value={sessions.completedThisMonth} icon={Calendar} tone="good" />
              </div>
            </div>
          </div>
        </details>
      </MobileAdminScreen>

      {/* ============================ DESKTOP =========================== */}
      <section className="hidden md:block">
        <AdvisorCard className="mb-3" />

        {/* Hero metric strip */}
<div className="grid grid-cols-3 gap-2 mb-4">
           <Stat label={language === 'he' ? 'היום' : language === 'es' ? 'Hoy' : 'Today'} value={(fmt(revenue.todayCents, revenue.currency))} icon={TrendingUp} tone="good" />
           <Stat label={language === 'he' ? 'לידים פתוחים' : language === 'es' ? 'Leads abiertos' : 'Open leads'} value={leads.needFollowup} icon={AlertCircle} tone={leads.needFollowup > 0 ? 'warn' : 'default'} />
           <Stat label={language === 'he' ? 'פולואפים' : language === 'es' ? 'Seguimientos' : 'Follow-ups'} value={actions.overdueFollowups} icon={ClipboardCheck} tone={actions.overdueFollowups > 0 ? 'warn' : 'default'} />
         </div>

         <details className="group rounded-2xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
           <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-medium flex items-center justify-between min-h-[44px]">
            <span className="text-muted-foreground">
              {language === 'he' ? 'כל המדדים · הכנסות, לידים, לקוחות, סשנים' : language === 'es' ? 'Todas las métricas · Ingresos, leads, clientes, sesiones' : 'All metrics · Revenue, leads, clients, sessions'}
            </span>
            <ChevronLeft className="h-4 w-4 opacity-60 transition-transform group-open:-rotate-90" />
          </summary>
          <div className="px-3 pb-3 space-y-3">
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{language === 'he' ? 'הכנסות' : language === 'es' ? 'Ingresos' : 'Revenue'}</h4>
              <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
                <Stat label={language === 'he' ? 'היום' : language === 'es' ? 'Hoy' : 'Today'} value={fmt(revenue.todayCents, revenue.currency)} icon={TrendingUp} tone="good" />
                <Stat label={language === 'he' ? 'החודש' : language === 'es' ? 'Este mes' : 'This month'} value={fmt(revenue.monthCents, revenue.currency)} icon={CreditCard} tone="good" />
                <Stat label={language === 'he' ? 'ממתין' : language === 'es' ? 'Pendiente' : 'Pending'} value={fmt(revenue.pendingCents, revenue.currency)} hint={`${revenue.pendingClientCount} ${language === 'he' ? 'לקוחות' : language === 'es' ? 'clientes' : 'clients'}`} icon={Clock} tone="warn" />
                <Stat label={language === 'he' ? 'תשלומים שולמו' : language === 'es' ? 'Pagos realizados' : 'Payments paid'} value={revenue.paidCount} icon={CreditCard} />
                <Stat label={language === 'he' ? 'לקוחות בחוב' : language === 'es' ? 'Clientes en deuda' : 'Clients in debt'} value={revenue.pendingClientCount} icon={AlertCircle} tone={revenue.pendingClientCount > 0 ? 'warn' : 'default'} />
              </div>
            </div>
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{language === 'he' ? 'לידים' : language === 'es' ? 'Leads' : 'Leads'}</h4>
              <div className="grid gap-2 grid-cols-2 md:grid-cols-6">
                <Stat label={language === 'he' ? 'חדשים' : language === 'es' ? 'Nuevos' : 'New'} value={leads.new} icon={Users} />
                <Stat label={language === 'he' ? 'פעילים' : language === 'es' ? 'Activos' : 'Active'} value={leads.active} icon={Users} />
                <Stat label={language === 'he' ? 'ממתינים לפולואפ' : language === 'es' ? 'Pendientes de seguimiento' : 'Pending follow-up'} value={leads.needFollowup} icon={AlertCircle} tone={leads.needFollowup > 0 ? 'warn' : 'default'} />
                <Stat label={language === 'he' ? 'הומרו' : language === 'es' ? 'Convertidos' : 'Converted'} value={leads.converted} icon={Users} tone="good" />
                <Stat label={language === 'he' ? 'חזרו 🔁' : language === 'es' ? 'Regresaron 🔁' : 'Returned 🔁'} value={resub?.total ?? 0} icon={AlertCircle} tone={(resub?.total ?? 0) > 0 ? 'warn' : 'default'} />
                <Stat label={language === 'he' ? 'סה״כ' : language === 'es' ? 'Total' : 'Total'} value={leads.total} icon={Users} />
              </div>
            </div>
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{language === 'he' ? 'לקוחות' : language === 'es' ? 'Clientes' : 'Clients'}</h4>
              <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                <Stat label={language === 'he' ? 'פעילים' : language === 'es' ? 'Activos' : 'Active'} value={clients.active} icon={Users} />
                <Stat label={language === 'he' ? 'חדשים החודש' : language === 'es' ? 'Nuevos este mes' : 'New this month'} value={clients.newThisMonth} icon={Users} tone="good" />
                <Stat label={language === 'he' ? 'עם סשן הבא' : language === 'es' ? 'Con próxima sesión' : 'With next session'} value={clients.withUpcomingSession} icon={Calendar} />
                <Stat label={language === 'he' ? 'ללא סשן הבא' : language === 'es' ? 'Sin próxima sesión' : 'Without next session'} value={clients.withoutNextSession} icon={AlertCircle} tone={clients.withoutNextSession > 0 ? 'warn' : 'default'} />
              </div>
            </div>
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{language === 'he' ? 'סשנים' : language === 'es' ? 'Sesiones' : 'Sessions'}</h4>
              <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                <Stat label={language === 'he' ? 'היום' : language === 'es' ? 'Hoy' : 'Today'} value={sessions.today} icon={Calendar} tone={sessions.today > 0 ? 'good' : 'default'} />
                <Stat label={language === 'he' ? 'עתידיים' : language === 'es' ? 'Futuras' : 'Upcoming'} value={sessions.upcoming} icon={Calendar} />
                <Stat label={language === 'he' ? 'הושלמו החודש' : language === 'es' ? 'Completadas este mes' : 'Completed this month'} value={sessions.completedThisMonth} icon={Calendar} tone="good" />
                <Stat label={language === 'he' ? 'בוטלו/לא הופיע' : language === 'es' ? 'Canceladas/No show' : 'Cancelled/No show'} value={sessions.cancelledThisMonth} icon={AlertCircle} tone={sessions.cancelledThisMonth > 0 ? 'warn' : 'default'} />
              </div>
            </div>
          </div>
        </details>
      </section>


      <section className="hidden md:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{language === 'he' ? 'תור פעולות להיום' : language === 'es' ? 'Acciones para hoy' : 'Actions for today'}</h3>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4 mb-3">
          <Stat label={language === 'he' ? 'פולואפים באיחור' : language === 'es' ? 'Seguimientos vencidos' : 'Overdue follow-ups'} value={actions.overdueFollowups} icon={AlertCircle} tone={actions.overdueFollowups > 0 ? 'warn' : 'default'} />
          <Stat label={language === 'he' ? 'פולואפים להיום' : language === 'es' ? 'Seguimientos para hoy' : 'Follow-ups due today'} value={actions.followupsDueToday} icon={FileText} />
          <Stat label={language === 'he' ? 'תשלומים ממתינים' : language === 'es' ? 'Pagos pendientes' : 'Pending payments'} value={actions.pendingPayments} icon={CreditCard} tone={actions.pendingPayments > 0 ? 'warn' : 'default'} />
          <Stat label={language === 'he' ? 'צ׳ק-אינים ממתינים' : language === 'es' ? 'Check-ins pendientes' : 'Pending check-ins'} value={actions.pendingCheckins} icon={ClipboardCheck} tone={actions.pendingCheckins > 0 ? 'warn' : 'default'} />
        </div>

        {/* Compact operational row — always visible */}
        <div className="flex gap-2 mb-3">
          {[
            { label: language === 'he' ? 'סשנים' : language === 'es' ? 'Sesiones' : 'Sessions', value: sessions.upcoming, icon: Calendar },
            { label: language === 'he' ? 'פולואפים' : language === 'es' ? 'Seguimientos' : 'Follow-ups', value: actions.overdueFollowups, icon: ClipboardCheck, warn: actions.overdueFollowups > 0 },
            { label: language === 'he' ? 'תשלומים' : language === 'es' ? 'Pagos' : 'Payments', value: actions.pendingPayments, icon: CreditCard, warn: actions.pendingPayments > 0 },
          ].map(s => (
            <div
              key={s.label}
              className="flex-1 rounded-2xl border border-border/40 bg-card/60 px-3 py-2.5 text-center"
            >
              <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.warn ? 'text-amber-500' : 'text-muted-foreground/60'}`} strokeWidth={1.5} />
              <div className={`text-base font-semibold leading-tight ${s.warn ? 'text-amber-500' : ''}`}>{s.value}</div>
              <div className="text-[9px] text-muted-foreground truncate mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Detailed cards — only when items exist */}
        {sessions.upcomingList.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 mb-3">
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'סשנים קרובים' : language === 'es' ? 'Próximas sesiones' : 'Upcoming sessions'} ({sessions.upcomingList.length})</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 pt-0">
                {sessions.upcomingList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/clients/${s.client_id}`)}
                    className="w-full flex items-center justify-between text-sm hover:bg-muted/50 rounded px-2 py-1.5 transition"
                  >
                    <span>{new Date(s.scheduled_at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {actions.overdueFollowupList.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 mb-3">
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'פולואפים באיחור' : language === 'es' ? 'Seguimientos vencidos' : 'Overdue follow-ups'} ({actions.overdueFollowups})</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 pt-0">
                {actions.overdueFollowupList.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => f.client_id && navigate(`/clients/${f.client_id}`)}
                    className="w-full text-right flex items-center justify-between gap-2 text-sm hover:bg-muted/50 rounded px-2 py-1.5 transition"
                  >
                    <span className="truncate flex-1">{f.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {f.due_at ? new Date(f.due_at).toLocaleDateString(locale) : '—'}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {actions.pendingPaymentList.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 mb-3">
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'תשלומים ממתינים' : language === 'es' ? 'Pagos pendientes' : 'Pending payments'} ({actions.pendingPayments})</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 pt-0">
                {actions.pendingPaymentList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/clients/${p.client_id}`)}
                    className="w-full flex items-center justify-between text-sm hover:bg-muted/50 rounded px-2 py-1.5 transition"
                  >
                    <span>{fmt(p.amount_cents, p.currency)}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.due_at ? `${language === 'he' ? 'יעד' : language === 'es' ? 'Fecha' : 'Due'} ${new Date(p.due_at).toLocaleDateString(locale)}` : '—'}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {insights && (
        <MobileCollapsible title={`Onboarding · ${language === 'he' ? 'משימות פתוחות' : language === 'es' ? 'Tareas abiertas' : 'Open tasks'}`}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'לידים בהמתנה למענה' : language === 'es' ? 'Leads esperando respuesta' : 'Leads awaiting reply'}</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.leadsAwaitingReply.length === 0
                  ? <p className="text-xs text-muted-foreground">{language === 'he' ? 'אין לידים פתוחים.' : language === 'es' ? 'No hay leads abiertos.' : 'No open leads.'}</p>
                  : insights.leadsAwaitingReply.map((l) => (
                    <button key={l.id} onClick={() => navigate('/admin?tab=coach&sub=leads')}
                      className="w-full text-right text-sm hover:bg-muted/50 rounded px-2 py-1 truncate">
                      {l.name} <span className="text-xs text-muted-foreground">· {new Date(l.created_at).toLocaleDateString(locale)}</span>
                    </button>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'לקוחות ללא סשן ראשון' : language === 'es' ? 'Clientes sin primera sesión' : 'Clients without first session'}</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.clientsWithoutSession.length === 0
                  ? <p className="text-xs text-muted-foreground">{language === 'he' ? 'כולם תוזמנו.' : language === 'es' ? 'Todos programados.' : 'All scheduled.'}</p>
                  : insights.clientsWithoutSession.map((c) => (
                    <button key={c.client_id} onClick={() => navigate(`/clients/${c.client_id}`)}
                      className="w-full text-right text-sm hover:bg-muted/50 rounded px-2 py-1 truncate">{c.full_name}</button>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'לקוחות ללא טופס קבלה' : language === 'es' ? 'Clientes sin formulario de admisión' : 'Clients without intake form'}</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.clientsWithoutIntake.length === 0
                  ? <p className="text-xs text-muted-foreground">{language === 'he' ? 'כל הטפסים מצורפים.' : language === 'es' ? 'Todos los formularios adjuntos.' : 'All forms attached.'}</p>
                  : insights.clientsWithoutIntake.map((c) => (
                    <button key={c.client_id} onClick={() => navigate(`/clients/${c.client_id}`)}
                      className="w-full text-right text-sm hover:bg-muted/50 rounded px-2 py-1 truncate">{c.full_name}</button>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'לקוחות ללא תשלום' : language === 'es' ? 'Clientes sin pago' : 'Clients without payment'}</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {insights.clientsWithoutPayment.length === 0
                  ? <p className="text-xs text-muted-foreground">{language === 'he' ? 'כולם שילמו.' : language === 'es' ? 'Todos pagaron.' : 'All paid.'}</p>
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
        <MobileCollapsible title={`Exire Landing · ${language === 'he' ? 'משפך' : language === 'es' ? 'Embudo' : 'Funnel'}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Exire Landing · {language === 'he' ? 'משפך' : language === 'es' ? 'Embudo' : 'Funnel'}</h2>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="ghost" className="text-xs gap-1">
                <a href="/exire" target="_blank" rel="noopener noreferrer">{language === 'he' ? 'פתח עמוד נחיתה' : language === 'es' ? 'Abrir página de aterrizaje' : 'Open landing page'}<ChevronLeft className="h-3 w-3" /></a>
              </Button>
              <Button size="sm" variant="ghost" className="text-xs"
                onClick={() => navigate('/admin?tab=coach&sub=leads&source=exire_landing')}>
                {language === 'he' ? 'לידים במשפך' : language === 'es' ? 'Leads en el embudo' : 'Leads in funnel'}
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5 mb-3">
            <Stat label={language === 'he' ? 'לידים היום' : language === 'es' ? 'Leads hoy' : 'Leads today'}      value={funnel.leadsToday}        icon={TrendingUp} tone={funnel.leadsToday > 0 ? 'good' : 'default'} />
            <Stat label={language === 'he' ? 'לידים החודש' : language === 'es' ? 'Leads este mes' : 'Leads this month'}     value={funnel.leadsThisMonth}    icon={Calendar} />
            <Stat label={language === 'he' ? 'ממתינים למענה' : language === 'es' ? 'Esperando respuesta' : 'Awaiting reply'}   value={funnel.awaitingFirstReply} icon={AlertCircle} tone={funnel.awaitingFirstReply > 0 ? 'warn' : 'default'} />
            <Stat label={language === 'he' ? 'ללא פולואפ' : language === 'es' ? 'Sin seguimiento' : 'No follow-up'}       value={funnel.withoutFollowup}   icon={ClipboardCheck} tone={funnel.withoutFollowup > 0 ? 'warn' : 'default'} />
            <Stat label={language === 'he' ? 'הומרו ללקוחות' : language === 'es' ? 'Convertidos a clientes' : 'Converted to clients'}   value={funnel.converted}         icon={Users} tone="good" />
          </div>
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'לידים אחרונים מהמשפך' : language === 'es' ? 'Últimos leads del embudo' : 'Latest leads from funnel'}</CardTitle></CardHeader>
            <CardContent className="space-y-1 pt-0">
              {funnel.latest.length === 0 && (
                <p className="text-xs text-muted-foreground">{language === 'he' ? 'עדיין אין לידים מעמוד הנחיתה.' : language === 'es' ? 'Aún no hay leads de la página de aterrizaje.' : 'No leads from landing page yet.'}</p>
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
                    {new Date(l.created_at).toLocaleDateString(locale)}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </MobileCollapsible>
      )}

      {formMetrics && formMetrics.formIds.length > 0 && (
        <MobileCollapsible title={`Exire · ${language === 'he' ? 'טפסי לידים' : language === 'es' ? 'Formularios de leads' : 'Lead Forms'}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Exire · {language === 'he' ? 'טפסי לידים' : language === 'es' ? 'Formularios de leads' : 'Lead Forms'}</h2>
            <Button size="sm" variant="ghost" className="text-xs"
              onClick={() => navigate('/admin?tab=coach&sub=exire-lead-forms')}>
              {language === 'he' ? 'נהל מיפויי טפסים' : language === 'es' ? 'Gestionar mapeos de formularios' : 'Manage form mappings'}
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5 mb-3">
            <Stat label={language === 'he' ? 'לידים מטפסים היום' : language === 'es' ? 'Leads de formularios hoy' : 'Leads from forms today'} value={formMetrics.leadsToday} icon={TrendingUp} tone={formMetrics.leadsToday > 0 ? 'good' : 'default'} />
            <Stat label={language === 'he' ? 'ממתינים למענה ראשון' : language === 'es' ? 'Esperando primera respuesta' : 'Awaiting first reply'} value={formMetrics.awaitingFirstReply} icon={AlertCircle} tone={formMetrics.awaitingFirstReply > 0 ? 'warn' : 'default'} />
            <Stat label={language === 'he' ? 'הגשות לא מסונכרנות' : language === 'es' ? 'Envíos no sincronizados' : 'Unsynced submissions'} value={formMetrics.totalUnsynced} icon={ClipboardCheck} tone={formMetrics.totalUnsynced > 0 ? 'warn' : 'default'} />
            <Stat label={language === 'he' ? 'סך הגשות' : language === 'es' ? 'Total envíos' : 'Total submissions'} value={formMetrics.totalSubmissions} icon={FileText} />
            <Stat label={language === 'he' ? 'סך סונכרנו' : language === 'es' ? 'Total sincronizados' : 'Total synced'} value={formMetrics.totalSynced} icon={Users} tone="good" />
          </div>
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">{language === 'he' ? 'לידים אחרונים מטפסים' : language === 'es' ? 'Últimos leads de formularios' : 'Latest leads from forms'}</CardTitle></CardHeader>
            <CardContent className="space-y-1 pt-0">
              {formMetrics.latest.length === 0 && (
                <p className="text-xs text-muted-foreground">{language === 'he' ? 'עוד לא נוצרו לידים מטפסים מסומנים.' : language === 'es' ? 'Aún no se crearon leads de formularios marcados.' : 'No leads created from marked forms yet.'}</p>
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
                    {new Date(l.created_at).toLocaleDateString(locale)}
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
          <span>{language === 'he' ? 'הכנה להשקה · רשימת בדיקות' : language === 'es' ? 'Preparación para lanzamiento · Lista de verificación' : 'Launch prep · Checklist'}</span>
          <span className="text-xs opacity-60 group-open:hidden">{language === 'he' ? 'הצג' : language === 'es' ? 'Mostrar' : 'Show'}</span>
          <span className="text-xs opacity-60 hidden group-open:inline">{language === 'he' ? 'הסתר' : language === 'es' ? 'Ocultar' : 'Hide'}</span>
        </summary>
        <div className="px-3 pb-3">
          <ExireLaunchChecklist />
        </div>
      </details>
    </div>
  );
}
