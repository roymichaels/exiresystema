import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CoachIntegrations {
  user_id: string;
  twilio_from: string | null;
  twilio_whatsapp_from: string | null;
  default_calendar_id: string | null;
  default_session_duration_min: number | null;
  default_session_price_usd: number | null;
  stripe_session_price_id: string | null;
  email_from: string | null;
  email_signature: string | null;
  brand_color: string | null;
  metadata: Record<string, unknown> | null;
}

export const useCoachIntegrations = () => {
  return useQuery({
    queryKey: ['coach_integrations'],
    queryFn: async (): Promise<CoachIntegrations | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('coach_integrations' as never)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as CoachIntegrations) || null;
    },
  });
};

export const useSaveCoachIntegrations = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<CoachIntegrations>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('coach_integrations' as never)
        .upsert({ user_id: user.id, ...patch } as never, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coach_integrations'] });
      toast.success('הגדרות נשמרו');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

/**
 * Probe each integration's edge function to detect whether the underlying
 * connector / secret is configured. Returns a status map.
 */
export type IntegrationKey = 'email' | 'whatsapp' | 'calendar' | 'stripe';
export type IntegrationStatus = 'connected' | 'not_connected' | 'error' | 'unknown';

export const useIntegrationStatus = () => {
  return useQuery({
    queryKey: ['integration_status'],
    queryFn: async (): Promise<Record<IntegrationKey, IntegrationStatus>> => {
      const { data, error } = await supabase.functions.invoke('integration-status');
      if (error) return { email: 'unknown', whatsapp: 'unknown', calendar: 'unknown', stripe: 'unknown' };
      return data as Record<IntegrationKey, IntegrationStatus>;
    },
    staleTime: 30_000,
  });
};
