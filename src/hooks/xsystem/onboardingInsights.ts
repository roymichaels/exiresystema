/**
 * Onboarding-quality queries for the Exire dashboard.
 * Surface: leads without first reply, converted clients missing intake/session/payment.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export interface OnboardingTask {
  client_id: string;
  full_name: string;
  reason: string;
}

export interface LeadAwaitingReply {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

export interface OnboardingInsights {
  leadsAwaitingReply: LeadAwaitingReply[];
  clientsWithoutSession: OnboardingTask[];
  clientsWithoutIntake: OnboardingTask[];
  clientsWithoutPayment: OnboardingTask[];
}

export function useOnboardingInsights() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['xsystem', 'onboarding_insights', user?.id, currentTenant?.id],
    enabled: !!user?.id && !!currentTenant?.id,
    queryFn: async (): Promise<OnboardingInsights> => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const pid = user!.id;
      const tid = currentTenant.id;

      const [clientsRes, sessionsRes, paymentsRes, submissionsRes, leadsRes] = await Promise.all([
        supabase.from('clients' as any)
          .select('id,full_name,created_at')
          .eq('practitioner_id', pid)
          .eq('tenant_id', tid),
        supabase.from('xsystem_sessions' as any)
          .select('client_id')
          .eq('practitioner_id', pid)
          .eq('tenant_id', tid),
        supabase.from('xsystem_payments' as any)
          .select('client_id')
          .eq('practitioner_id', pid)
          .eq('tenant_id', tid),
        supabase.from('form_submissions' as any)
          .select('client_id')
          .not('client_id', 'is', null)
          .eq('tenant_id', tid),
        supabase.from('leads')
          .select('id,name,phone,status,contacted_at,created_at')
          .in('status', ['new', 'contacted'])
          .eq('tenant_id', tid)
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      const clients = (clientsRes.data || []) as any[];
      const sessions = (sessionsRes.data || []) as any[];
      const payments = (paymentsRes.data || []) as any[];
      const submissions = (submissionsRes.data || []) as any[];
      const leads = (leadsRes.data || []) as any[];

      const withSession = new Set(sessions.map((s) => s.client_id));
      const withPayment = new Set(payments.map((p) => p.client_id));
      const withIntake = new Set(submissions.map((s) => s.client_id));

      const make = (reason: string) =>
        (c: any): OnboardingTask => ({ client_id: c.id, full_name: c.full_name, reason });

      const clientsWithoutSession = clients
        .filter((c) => !withSession.has(c.id)).slice(0, 10).map(make('אין סשן'));
      const clientsWithoutIntake = clients
        .filter((c) => !withIntake.has(c.id)).slice(0, 10).map(make('אין טופס קבלה'));
      const clientsWithoutPayment = clients
        .filter((c) => !withPayment.has(c.id)).slice(0, 10).map(make('אין תשלום'));

      const leadsAwaitingReply: LeadAwaitingReply[] = leads
        .filter((l) => !l.contacted_at)
        .slice(0, 10)
        .map((l) => ({ id: l.id, name: l.name, phone: l.phone, created_at: l.created_at }));

      return { leadsAwaitingReply, clientsWithoutSession, clientsWithoutIntake, clientsWithoutPayment };
    },
  });
}
