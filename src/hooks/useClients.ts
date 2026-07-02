/**
 * XSYSTEM clients data layer.
 * Phase 1: core CRUD + convert-from-lead helper.
 * Phase 3A: tenant-scoped queries.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  practitioner_id: string;
  lead_id: string | null;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram_handle: string | null;
  manychat_id: string | null;
  language: string | null;
  birthday: string | null;
  tags: string[];
  status: 'active' | 'paused' | 'closed' | string;
  risk_flags: Record<string, unknown>;
  consent: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  client_id: string;
  goals: unknown[];
  presenting_issues: unknown[];
  subconscious_summary: string | null;
  last_updated_by: string | null;
  created_at: string;
  updated_at: string;
}

const KEY = ['xsystem', 'clients'] as const;

export function useClients() {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: [...KEY, currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Client[];
    },
  });
}

export function useClient(id: string | undefined) {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: [...KEY, id, currentTenant?.id],
    enabled: !!id && !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .eq('id', id!)
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Client | null;
    },
  });
}

/** Look up an existing client converted from a given lead (if any). */
export function useClientByLeadId(leadId: string | undefined) {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: [...KEY, 'by-lead', leadId, currentTenant?.id],
    enabled: !!leadId && !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from('clients' as any)
        .select('id,full_name')
        .eq('lead_id', leadId!)
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as { id: string; full_name: string } | null;
    },
  });
}

export function useClientProfile(clientId: string | undefined) {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: [...KEY, clientId, 'profile', currentTenant?.id],
    enabled: !!clientId && !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from('client_profiles' as any)
        .select('*')
        .eq('client_id', clientId!)
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ClientProfile | null;
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async (input: Partial<Client> & { full_name: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { data, error } = await supabase
        .from('clients' as any)
        .insert({
          practitioner_id: user.id,
          tenant_id: currentTenant.id,
          full_name: input.full_name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          whatsapp: input.whatsapp ?? null,
          instagram_handle: input.instagram_handle ?? null,
          manychat_id: input.manychat_id ?? null,
          lead_id: input.lead_id ?? null,
          notes: input.notes ?? null,
          language: input.language ?? 'he',
          tags: input.tags ?? [],
          status: input.status ?? 'active',
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as Client;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast({ title: 'הלקוח נוצר' });
    },
    onError: (e: any) =>
      toast({ title: 'שגיאה ביצירת לקוח', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { data, error } = await supabase
        .from('clients' as any)
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as Client;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/**
 * Convert a lead into a client. Idempotent on (practitioner_id, lead_id).
 */
export function useConvertLeadToClient() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async (lead: {
      id: string;
      name?: string | null;
      phone?: string | null;
      email?: string | null;
      notes?: string | null;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!currentTenant?.id) throw new Error('No tenant context');

      const existing = await supabase
        .from('clients' as any)
        .select('id')
        .eq('practitioner_id', user.id)
        .eq('lead_id', lead.id)
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();
      if (existing.data) return existing.data as unknown as { id: string };

      const { data, error } = await supabase
        .from('clients' as any)
        .insert({
          practitioner_id: user.id,
          tenant_id: currentTenant.id,
          lead_id: lead.id,
          full_name: lead.name || 'ללא שם',
          phone: lead.phone ?? null,
          email: lead.email ?? null,
          notes: lead.notes ?? null,
          status: 'active',
        })
        .select('id')
        .single();
      if (error) throw error;

      // Best-effort: mark lead as converted.
      await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id).eq('tenant_id', currentTenant.id);

      return data as unknown as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'הליד הומר ללקוח' });
    },
    onError: (e: any) =>
      toast({ title: 'שגיאה בהמרה', description: e.message, variant: 'destructive' }),
  });
}
