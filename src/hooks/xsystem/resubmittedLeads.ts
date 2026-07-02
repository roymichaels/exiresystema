/**
 * Phase 2M — Resubmitted leads metric.
 *
 * Counts landing-source leads that have been resubmitted (per the dedup
 * flow in the `submit-landing-lead` edge function). Used by the Exire
 * Dashboard and the Launch Checklist.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const LANDING_SOURCES = ['homepage', 'exire_landing', 'exire_form', 'exire_instagram_form'];

export type ResubmittedLead = {
  id: string;
  name: string;
  source: string;
  resubmit_count: number;
  resubmitted_at: string | null;
};

export function useResubmittedLeads() {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['exire', 'resubmittedLeads', currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, source, metadata, tags, updated_at')
        .in('source', LANDING_SOURCES)
        .eq('tenant_id', currentTenant.id)
        .order('updated_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      const rows = (data || []) as Array<{
        id: string; name: string; source: string;
        metadata: Record<string, unknown> | null;
        tags: string[] | null; updated_at: string | null;
      }>;
      const list: ResubmittedLead[] = rows
        .map((r) => {
          const m = r.metadata || {};
          const count = typeof (m as Record<string, unknown>).resubmit_count === 'number'
            ? ((m as Record<string, unknown>).resubmit_count as number)
            : (Array.isArray(r.tags) && r.tags.includes('resubmitted') ? 1 : 0);
          const at = ((m as Record<string, unknown>).resubmitted_at as string | undefined) || r.updated_at;
          return { id: r.id, name: r.name, source: r.source, resubmit_count: count, resubmitted_at: at || null };
        })
        .filter((r) => r.resubmit_count > 0);
      return {
        total: list.length,
        latest: list.slice(0, 5),
      };
    },
    staleTime: 60_000,
  });
}
