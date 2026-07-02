import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export type LeadSource = 'intake_chat' | 'landing_page' | 'exit_intent' | 'manual' | 'affiliate' | string;
export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'converted' | 'lost' | string;

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  landing_page_id: string | null;
  preferred_time: string | null;
  affiliate_code: string | null;
  conversation: unknown[];
  pain_category: string | null;
  pain_duration: string | null;
  prior_attempts: string[] | null;
  desired_outcome: string | null;
  transformation_vision: string | null;
  readiness_score: number | null;
  intent: string | null;
  ai_analysis: Record<string, unknown> | null;
  contacted_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export const useLeads = () => {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['leads', 'unified', currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async (): Promise<Lead[]> => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Lead[];
    },
  });
};

export const useLeadStats = () => {
  const { data: leads, isLoading } = useLeads();
  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    scheduled: leads?.filter(l => l.status === 'scheduled').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0,
    lost: leads?.filter(l => l.status === 'lost').length || 0,
  };
  return { stats, isLoading };
};

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['leads'] });
  qc.invalidateQueries({ queryKey: ['admin-new-leads'] });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pick<Lead, 'status' | 'notes' | 'tags' | 'contacted_at'>> }) => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const patch: Record<string, unknown> = { ...updates };
      if (updates.status && updates.status !== 'new' && !('contacted_at' in updates)) {
        patch.contacted_at = new Date().toISOString();
      }
      const { error } = await supabase.from('leads').update(patch as never).eq('id', id).eq('tenant_id', currentTenant.id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(qc); toast.success('עודכן'); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { error } = await supabase.from('leads').delete().eq('id', id).eq('tenant_id', currentTenant.id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(qc); toast.success('נמחק'); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useAddLead = () => {
  const qc = useQueryClient();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async (lead: { name: string; phone?: string | null; email?: string | null; notes?: string; source?: LeadSource }) => {
      if (!lead.phone && !lead.email) throw new Error('צריך טלפון או אימייל');
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: lead.name,
          phone: lead.phone || null,
          email: lead.email || null,
          notes: lead.notes || null,
          source: lead.source || 'manual',
          status: 'new',
          tenant_id: currentTenant.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidate(qc); toast.success('ליד נוצר'); },
    onError: (e: Error) => toast.error(e.message),
  });
};
