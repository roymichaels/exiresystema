/**
 * XSYSTEM practitioner-level dashboard hooks.
 * Aggregate revenue/leads/clients/sessions/action queue across all clients
 * of the current practitioner.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function startOfDay(d = new Date()) {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export interface XSysDashboardData {
  revenue: {
    todayCents: number;
    monthCents: number;
    pendingCents: number;
    paidCount: number;
    pendingClientCount: number;
    currency: string;
  };
  leads: {
    total: number;
    new: number;
    active: number;
    converted: number;
    needFollowup: number;
  };
  clients: {
    active: number;
    newThisMonth: number;
    withUpcomingSession: number;
    withoutNextSession: number;
  };
  sessions: {
    today: number;
    upcoming: number;
    completedThisMonth: number;
    cancelledThisMonth: number;
    upcomingList: Array<{ id: string; client_id: string; scheduled_at: string; status: string }>;
  };
  actions: {
    overdueFollowups: number;
    followupsDueToday: number;
    pendingPayments: number;
    pendingCheckins: number;
    overdueFollowupList: Array<{ id: string; client_id: string | null; lead_id: string | null; title: string; due_at: string | null }>;
    pendingPaymentList: Array<{ id: string; client_id: string; amount_cents: number; currency: string; due_at: string | null }>;
  };
}

export function useExireDashboard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['xsystem', 'dashboard', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<XSysDashboardData> => {
      const pid = user!.id;
      const todayStart = startOfDay().toISOString();
      const tomorrowStart = startOfDay(new Date(Date.now() + 86400000)).toISOString();
      const monthStart = startOfMonth().toISOString();
      const nowISO = new Date().toISOString();

      // Payments
      const [paymentsRes, leadsRes, clientsRes, sessionsRes, followupsRes, checkinsRes] = await Promise.all([
        supabase.from('xsystem_payments' as any)
          .select('amount_cents,currency,status,paid_at,due_at,client_id')
          .eq('practitioner_id', pid),
        supabase.from('leads')
          .select('id,status,created_at,contacted_at')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('clients' as any)
          .select('id,status,created_at')
          .eq('practitioner_id', pid),
        supabase.from('xsystem_sessions' as any)
          .select('id,client_id,scheduled_at,status')
          .eq('practitioner_id', pid),
        supabase.from('xsystem_followups' as any)
          .select('id,client_id,lead_id,title,due_at,status,priority')
          .eq('practitioner_id', pid),
        supabase.from('xsystem_checkins' as any)
          .select('id,payload')
          .eq('practitioner_id', pid),
      ]);

      const payments = (paymentsRes.data || []) as any[];
      const leads = (leadsRes.data || []) as any[];
      const clients = (clientsRes.data || []) as any[];
      const sessions = (sessionsRes.data || []) as any[];
      const followups = (followupsRes.data || []) as any[];
      const checkins = (checkinsRes.data || []) as any[];

      // ---- Revenue ----
      const paid = payments.filter((p) => p.status === 'paid');
      const pending = payments.filter((p) => p.status === 'pending');
      const todayCents = paid
        .filter((p) => p.paid_at && p.paid_at >= todayStart)
        .reduce((s, p) => s + (p.amount_cents || 0), 0);
      const monthCents = paid
        .filter((p) => p.paid_at && p.paid_at >= monthStart)
        .reduce((s, p) => s + (p.amount_cents || 0), 0);
      const pendingCents = pending.reduce((s, p) => s + (p.amount_cents || 0), 0);
      const pendingClientCount = new Set(pending.map((p) => p.client_id)).size;

      // ---- Leads ----
      const leadsTotal = leads.length;
      const newLeads = leads.filter((l) => l.status === 'new').length;
      const activeLeads = leads.filter((l) => ['new', 'contacted', 'scheduled'].includes(l.status)).length;
      const convertedLeads = leads.filter((l) => l.status === 'converted').length;
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const needFollowup = leads.filter(
        (l) => ['new', 'contacted'].includes(l.status) &&
          (!l.contacted_at || l.contacted_at < sevenDaysAgo),
      ).length;

      // ---- Clients ----
      const activeClients = clients.filter((c) => c.status === 'active').length;
      const newClientsMonth = clients.filter((c) => c.created_at >= monthStart).length;
      const clientsWithUpcoming = new Set(
        sessions
          .filter((s) => s.scheduled_at && s.scheduled_at >= nowISO && s.status === 'scheduled')
          .map((s) => s.client_id),
      );
      const withUpcomingSession = clientsWithUpcoming.size;
      const withoutNextSession = clients.filter((c) => !clientsWithUpcoming.has(c.id) && c.status === 'active').length;

      // ---- Sessions ----
      const sessionsToday = sessions.filter(
        (s) => s.scheduled_at && s.scheduled_at >= todayStart && s.scheduled_at < tomorrowStart,
      ).length;
      const upcoming = sessions
        .filter((s) => s.scheduled_at && s.scheduled_at >= nowISO && s.status === 'scheduled')
        .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
      const completedMonth = sessions.filter(
        (s) => s.status === 'completed' && s.scheduled_at && s.scheduled_at >= monthStart,
      ).length;
      const cancelledMonth = sessions.filter(
        (s) => ['cancelled', 'no_show'].includes(s.status) && s.scheduled_at && s.scheduled_at >= monthStart,
      ).length;

      // ---- Action queue ----
      const openFollowups = followups.filter((f) => f.status === 'open');
      const overdueFollowupList = openFollowups
        .filter((f) => f.due_at && f.due_at < todayStart)
        .sort((a, b) => +new Date(a.due_at) - +new Date(b.due_at));
      const followupsDueToday = openFollowups.filter(
        (f) => f.due_at && f.due_at >= todayStart && f.due_at < tomorrowStart,
      ).length;
      const pendingPaymentList = pending
        .map((p) => ({
          id: p.id, client_id: p.client_id, amount_cents: p.amount_cents,
          currency: p.currency, due_at: p.due_at,
        }));
      const pendingCheckinsCount = checkins.filter((c) => {
        const s = (c.payload as any)?.status;
        return s === 'pending' || s === 'submitted';
      }).length;

      return {
        revenue: {
          todayCents, monthCents, pendingCents,
          paidCount: paid.length, pendingClientCount,
          currency: payments[0]?.currency || 'ILS',
        },
        leads: { total: leadsTotal, new: newLeads, active: activeLeads, converted: convertedLeads, needFollowup },
        clients: { active: activeClients, newThisMonth: newClientsMonth, withUpcomingSession, withoutNextSession },
        sessions: {
          today: sessionsToday, upcoming: upcoming.length,
          completedThisMonth: completedMonth, cancelledThisMonth: cancelledMonth,
          upcomingList: upcoming.slice(0, 10),
        },
        actions: {
          overdueFollowups: overdueFollowupList.length,
          followupsDueToday,
          pendingPayments: pending.length,
          pendingCheckins: pendingCheckinsCount,
          overdueFollowupList: overdueFollowupList.slice(0, 10),
          pendingPaymentList: pendingPaymentList.slice(0, 10),
        },
      };
    },
  });
}
