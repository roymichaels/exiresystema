import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ActivityKind = 'whatsapp' | 'sms' | 'email' | 'call' | 'note' | 'booking' | 'payment';

export interface LeadActivity {
  id: string;
  lead_id: string | null;
  client_user_id: string | null;
  kind: ActivityKind;
  direction: 'outbound' | 'inbound' | 'system';
  subject: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
  status: string | null;
  external_id: string | null;
  created_by: string | null;
  created_at: string;
}

export const useLeadActivity = (leadId?: string | null) => {
  return useQuery({
    queryKey: ['lead_activity', leadId],
    enabled: !!leadId,
    queryFn: async (): Promise<LeadActivity[]> => {
      const { data, error } = await supabase
        .from('lead_activity' as never)
        .select('*')
        .eq('lead_id', leadId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as LeadActivity[]) || [];
    },
  });
};

export const useLogActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Partial<LeadActivity> & { kind: ActivityKind }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('lead_activity' as never)
        .insert({ ...entry, created_by: user?.id ?? null } as never);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['lead_activity', vars.lead_id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
