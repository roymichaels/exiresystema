/**
 * Exire funnel metrics (source = 'exire_landing').
 * Used by ExireDashboard funnel card and admin filtering.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export interface ExireFunnelMetrics {
  leadsToday: number;
  leadsThisMonth: number;
  awaitingFirstReply: number;
  withoutFollowup: number;
  converted: number;
  latest: Array<{
    id: string; name: string; phone: string | null; status: string;
    pain_category: string | null; desired_outcome: string | null;
    created_at: string; contacted_at: string | null;
  }>;
}

export function useExireFunnelMetrics() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['xsystem', 'exire_funnel', user?.id, currentTenant?.id],
    enabled: !!user?.id && !!currentTenant?.id,
    queryFn: async (): Promise<ExireFunnelMetrics> => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const tid = currentTenant.id;
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

      const [leadsRes, followupsRes] = await Promise.all([
        supabase.from('leads')
          .select('id,name,phone,status,pain_category,desired_outcome,created_at,contacted_at')
          .eq('source', 'exire_landing')
          .eq('tenant_id', tid)
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('xsystem_followups' as any)
          .select('lead_id')
          .not('lead_id', 'is', null)
          .eq('tenant_id', tid),
      ]);

      const leads = (leadsRes.data || []) as any[];
      const followupLeadIds = new Set(((followupsRes.data || []) as any[]).map((f) => f.lead_id));

      const leadsToday = leads.filter((l) => new Date(l.created_at) >= startOfDay).length;
      const leadsThisMonth = leads.filter((l) => new Date(l.created_at) >= startOfMonth).length;
      const awaitingFirstReply = leads.filter((l) => !l.contacted_at && l.status === 'new').length;
      const withoutFollowup = leads.filter(
        (l) => l.status !== 'converted' && l.status !== 'lost' && !followupLeadIds.has(l.id),
      ).length;
      const converted = leads.filter((l) => l.status === 'converted').length;
      const latest = leads.slice(0, 8);

      return { leadsToday, leadsThisMonth, awaitingFirstReply, withoutFollowup, converted, latest };
    },
  });
}
