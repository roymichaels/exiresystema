/**
 * Phase 2L + 2M — Exire Launch Checklist.
 *
 * Derived status card (no schema). Pulls live data from existing hooks and
 * shows admin what is still missing before going live with marketing.
 * Phase 2M adds: dedup-active flag, test-duplicate-handled signal, and a
 * manually toggleable "templates reviewed" item (localStorage).
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, ChevronLeft } from 'lucide-react';
import { useExireFunnelSettings } from '@/hooks/xsystem/funnelSettings';
import { useExireFormMetrics, useLeadFormMappings } from '@/hooks/xsystem/leadFormSync';
import { useExireDashboard } from '@/hooks/xsystem/dashboard';
import { useResubmittedLeads } from '@/hooks/xsystem/resubmittedLeads';

type Item = { id: string; label: string; done: boolean; href?: string; onToggle?: () => void };

const TEMPLATES_KEY = 'exire.launch.templates_reviewed';

export default function ExireLaunchChecklist() {
  const navigate = useNavigate();
  const { data: settings } = useExireFunnelSettings();
  const { data: mappings = [] } = useLeadFormMappings();
  const { data: forms } = useExireFormMetrics();
  const { data: dash } = useExireDashboard();
  const { data: resub } = useResubmittedLeads();

  const [templatesReviewed, setTemplatesReviewed] = useState(false);
  useEffect(() => {
    try { setTemplatesReviewed(localStorage.getItem(TEMPLATES_KEY) === '1'); } catch { /* noop */ }
  }, []);
  const toggleTemplates = () => {
    const next = !templatesReviewed;
    setTemplatesReviewed(next);
    try { localStorage.setItem(TEMPLATES_KEY, next ? '1' : '0'); } catch { /* noop */ }
  };

  const activeMappings = mappings.filter(m => m.is_active);
  const items: Item[] = [
    { id: 'vsl',      label: 'VSL / וידאו פתיחה הוגדר',           done: !!settings?.exire_landing_video_url, href: '/admin?tab=coach&sub=exire-funnel' },
    { id: 'wa',       label: 'מספר וואטסאפ הוגדר',                 done: !!settings?.exire_whatsapp_number && settings.exire_whatsapp_number !== '972500000000', href: '/admin?tab=coach&sub=exire-funnel' },
    { id: 'intake',   label: 'טופס אינטייק ברירת מחדל נבחר',       done: !!settings?.exire_intake_form_id, href: '/admin?tab=coach&sub=exire-funnel' },
    { id: 'mapping',  label: 'מיפוי טופס לידים פעיל',              done: activeMappings.length > 0, href: '/admin?tab=coach&sub=exire-lead-forms' },
    { id: 'import',   label: 'הגשות ישנות יובאו ל-CRM',             done: !!forms && forms.totalUnsynced === 0 && forms.totalSubmissions > 0, href: '/admin?tab=coach&sub=exire-lead-forms' },
    { id: 'dedup',    label: 'דדופ ישיר על דף הנחיתה פעיל',         done: true },
    { id: 'duptest',  label: 'הגשה כפולה טופלה בהצלחה (בדיקה)',     done: (resub?.total ?? 0) > 0, href: '/admin?tab=coach&sub=leads' },
    { id: 'templates',label: 'תבניות הודעות נסקרו',                 done: templatesReviewed, onToggle: toggleTemplates },
    { id: 'lead',     label: 'התקבל ליד בדיקה',                     done: (dash?.leads.total ?? 0) > 0, href: '/admin?tab=coach&sub=leads' },
    { id: 'client',   label: 'הומרה לקוח בדיקה',                    done: (dash?.clients.active ?? 0) > 0, href: '/admin?tab=coach&sub=xsystem-clients' },
    { id: 'payment',  label: 'תשלום ראשון נרשם',                    done: (dash?.revenue.paidCount ?? 0) > 0, href: '/admin?tab=coach&sub=xsystem-clients' },
    { id: 'session',  label: 'סשן ראשון נקבע',                      done: ((dash?.sessions.today ?? 0) + (dash?.sessions.upcoming ?? 0) + (dash?.sessions.completedThisMonth ?? 0)) > 0, href: '/admin?tab=coach&sub=xsystem-clients' },
  ];

  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <Card className="border-primary/30 bg-primary/[0.02]">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Exire · רשימת השקה ({done}/{items.length} · {pct}%)</CardTitle>
        <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="grid gap-1 md:grid-cols-2">
          {items.map(it => (
            <li key={it.id}>
              <button
                onClick={() => it.onToggle ? it.onToggle() : (it.href && navigate(it.href))}
                className="w-full flex items-center gap-2 text-right text-sm rounded px-2 py-1.5 hover:bg-muted/50 transition"
              >
                {it.done
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                <span className={`flex-1 ${it.done ? 'text-muted-foreground line-through' : ''}`}>{it.label}</span>
                {!it.onToggle && <ChevronLeft className="h-3 w-3 text-muted-foreground" />}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
