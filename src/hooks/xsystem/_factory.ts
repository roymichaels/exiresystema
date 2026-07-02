/**
 * Tiny shared factory for client-scoped XSYSTEM hooks.
 * Phase 2D adds update + invalidation helpers. No hard delete — use status fields.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/hooks/use-toast';

type AnyRow = Record<string, any>;

export function createClientScopedHooks<T extends AnyRow>(opts: {
  table: string;
  domain: string;
  orderColumn?: string;
  ascending?: boolean;
}) {
  const { table, domain, orderColumn = 'created_at', ascending = false } = opts;

  const baseKey = ['xsystem', domain] as const;
  const listKey = (clientId?: string, tenantId?: string) => [...baseKey, 'list', clientId, tenantId] as const;
  const countKey = (clientId?: string, tenantId?: string) => [...baseKey, 'count', clientId, tenantId] as const;

  function invalidateAll(qc: ReturnType<typeof useQueryClient>, clientId?: string) {
    // Prefix matching covers all tenant-suffixed list/count keys for this client.
    qc.invalidateQueries({ queryKey: [...baseKey, 'list', clientId] });
    qc.invalidateQueries({ queryKey: [...baseKey, 'count', clientId] });
    // Also invalidate any sibling keys (e.g. active-count, open-count)
    qc.invalidateQueries({ queryKey: [...baseKey] });
  }

  function useList(clientId: string | undefined) {
    const { currentTenant } = useTenant();
    return useQuery({
      queryKey: listKey(clientId, currentTenant?.id),
      enabled: !!clientId && !!currentTenant?.id,
      queryFn: async () => {
        if (!currentTenant?.id) return [];
        const { data, error } = await supabase
          .from(table as any)
          .select('*')
          .eq('client_id', clientId!)
          .eq('tenant_id', currentTenant.id)
          .order(orderColumn, { ascending });
        if (error) throw error;
        return (data || []) as unknown as T[];
      },
    });
  }

  function useCount(clientId: string | undefined) {
    const { currentTenant } = useTenant();
    return useQuery({
      queryKey: countKey(clientId, currentTenant?.id),
      enabled: !!clientId && !!currentTenant?.id,
      queryFn: async () => {
        if (!currentTenant?.id) return 0;
        const { count, error } = await supabase
          .from(table as any)
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId!)
          .eq('tenant_id', currentTenant.id);
        if (error) throw error;
        return count ?? 0;
      },
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const { currentTenant } = useTenant();
    return useMutation({
      mutationFn: async (input: Partial<T> & { client_id: string }) => {
        if (!user?.id) throw new Error('Not authenticated');
        if (!currentTenant?.id) throw new Error('No tenant context');
        const payload = { ...input, practitioner_id: user.id, tenant_id: currentTenant.id };
        const { data, error } = await supabase
          .from(table as any)
          .insert(payload as any)
          .select('*')
          .single();
        if (error) throw error;
        return data as unknown as T;
      },
      onSuccess: (row) => {
        invalidateAll(qc, row.client_id);
        toast({ title: 'נשמר' });
      },
      onError: (e: any) =>
        toast({ title: 'שגיאה בשמירה', description: e.message, variant: 'destructive' }),
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    const { currentTenant } = useTenant();
    return useMutation({
      mutationFn: async ({
        id,
        updates,
      }: {
        id: string;
        updates: Partial<T>;
      }) => {
        if (!currentTenant?.id) throw new Error('No tenant context');
        const { data, error } = await supabase
          .from(table as any)
          .update(updates as any)
          .eq('id', id)
          .eq('tenant_id', currentTenant.id)
          .select('*')
          .single();
        if (error) throw error;
        return data as unknown as T;
      },
      onSuccess: (row) => {
        invalidateAll(qc, row.client_id);
        toast({ title: 'עודכן' });
      },
      onError: (e: any) =>
        toast({ title: 'שגיאה בעדכון', description: e.message, variant: 'destructive' }),
    });
  }

  return { useList, useCount, useCreate, useUpdate, listKey, countKey, baseKey };
}
