/**
 * Phase 2K — Exire Lead Form sync hooks.
 *
 * Practitioner-side hooks for managing form->CRM mappings and triggering syncs
 * via the `sync-form-lead` edge function. RLS keeps mappings per practitioner.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/hooks/use-toast';

export interface LeadFormMapping {
  id: string;
  practitioner_id: string;
  form_id: string;
  source_key: string;
  is_active: boolean;
  auto_sync: boolean;
  create_followup: boolean;
  field_mapping: Record<string, string>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PublishedFormRef {
  id: string;
  title: string;
  status: string;
  access_token: string | null;
  submission_count: number;
  synced_count: number;
}

export function usePublishedFormsWithCounts() {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['xsystem', 'lead_forms', 'published_with_counts', currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async (): Promise<PublishedFormRef[]> => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { data: forms, error } = await supabase
        .from('custom_forms')
        .select('id,title,status,access_token,created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (forms || []) as Array<{
        id: string; title: string; status: string; access_token: string | null;
      }>;
      if (list.length === 0) return [];

      const ids = list.map((f) => f.id);
      const { data: subs } = await supabase
        .from('form_submissions')
        .select('form_id, lead_id')
        .in('form_id', ids)
        .eq('tenant_id', currentTenant.id);

      const total = new Map<string, number>();
      const synced = new Map<string, number>();
      for (const r of (subs || []) as Array<{ form_id: string; lead_id: string | null }>) {
        total.set(r.form_id, (total.get(r.form_id) || 0) + 1);
        if (r.lead_id) synced.set(r.form_id, (synced.get(r.form_id) || 0) + 1);
      }

      return list.map((f) => ({
        ...f,
        submission_count: total.get(f.id) || 0,
        synced_count: synced.get(f.id) || 0,
      }));
    },
  });
}

export function useLeadFormMappings() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['xsystem', 'lead_form_mappings', user?.id, currentTenant?.id],
    enabled: !!user?.id && !!currentTenant?.id,
    queryFn: async (): Promise<LeadFormMapping[]> => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { data, error } = await supabase
        .from('xsystem_lead_form_mappings' as never)
        .select('*')
        .eq('practitioner_id', user!.id)
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
      return (data || []) as unknown as LeadFormMapping[];
    },
  });
}

export function useUpsertLeadFormMapping() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async (input: Partial<LeadFormMapping> & { form_id: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!currentTenant?.id) throw new Error('No tenant context');
      const payload: Record<string, unknown> = {
        practitioner_id: user.id,
        tenant_id: currentTenant.id,
        form_id: input.form_id,
        source_key: input.source_key ?? 'exire_form',
        is_active: input.is_active ?? true,
        auto_sync: input.auto_sync ?? true,
        create_followup: input.create_followup ?? true,
        field_mapping: input.field_mapping ?? {},
        tags: input.tags ?? ['exire', 'form_submission'],
      };
      const { data, error } = await supabase
        .from('xsystem_lead_form_mappings' as never)
        .upsert(payload as never, { onConflict: 'practitioner_id,form_id' })
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as LeadFormMapping;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'lead_form_mappings'] });
      qc.invalidateQueries({ queryKey: ['xsystem', 'lead_forms'] });
      toast({ title: 'נשמר' });
    },
    onError: (e: Error) => toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteLeadFormMapping() {
  const qc = useQueryClient();
  const { currentTenant } = useTenant();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const { error } = await supabase
        .from('xsystem_lead_form_mappings' as never)
        .delete()
        .eq('id', id)
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'lead_form_mappings'] });
      qc.invalidateQueries({ queryKey: ['xsystem', 'lead_forms'] });
      toast({ title: 'בוטל' });
    },
    onError: (e: Error) => toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

/** Retroactively import all unsynced submissions for a single form. */
export function useImportFormSubmissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formId: string) => {
      const { data, error } = await supabase.functions.invoke('sync-form-lead', {
        body: { form_id: formId },
      });
      if (error) throw error;
      return data as { ok: boolean; processed: number; created: number; skipped: number };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'lead_forms'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['xsystem', 'exire_form_metrics'] });
      toast({
        title: 'ייבוא הושלם',
        description: `נוצרו ${r?.created ?? 0} לידים מתוך ${r?.processed ?? 0} סנכרונים`,
      });
    },
    onError: (e: Error) => toast({ title: 'שגיאה בייבוא', description: e.message, variant: 'destructive' }),
  });
}

/** Fire-and-forget sync for one newly submitted public-form entry. */
export async function triggerFormSubmissionSync(submissionId: string) {
  try {
    await supabase.functions.invoke('sync-form-lead', {
      body: { submission_id: submissionId },
    });
  } catch (e) {
    // Never break public-form UX
    console.warn('[sync-form-lead] non-fatal', e);
  }
}

export interface ExireFormMetrics {
  formIds: string[];
  totalSubmissions: number;
  totalSynced: number;
  totalUnsynced: number;
  leadsToday: number;
  awaitingFirstReply: number;
  latest: Array<{
    id: string; name: string; phone: string | null;
    source: string; created_at: string; contacted_at: string | null;
    pain_category: string | null; desired_outcome: string | null;
    form_title: string | null;
  }>;
}

export function useExireFormMetrics() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['xsystem', 'exire_form_metrics', user?.id, currentTenant?.id],
    enabled: !!user?.id && !!currentTenant?.id,
    queryFn: async (): Promise<ExireFormMetrics> => {
      if (!currentTenant?.id) throw new Error('No tenant context');
      const tid = currentTenant.id;
      const { data: maps } = await supabase
        .from('xsystem_lead_form_mappings' as never)
        .select('form_id, source_key')
        .eq('practitioner_id', user!.id)
        .eq('is_active', true)
        .eq('tenant_id', tid);
      const list = (maps || []) as Array<{ form_id: string; source_key: string }>;
      const formIds = list.map((m) => m.form_id);
      const sourceKeys = Array.from(new Set(list.map((m) => m.source_key)));

      if (formIds.length === 0) {
        return {
          formIds, totalSubmissions: 0, totalSynced: 0, totalUnsynced: 0,
          leadsToday: 0, awaitingFirstReply: 0, latest: [],
        };
      }

      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);

      const [subsRes, leadsRes] = await Promise.all([
        supabase.from('form_submissions')
          .select('id, form_id, lead_id', { count: 'exact' })
          .in('form_id', formIds)
          .eq('tenant_id', tid),
        supabase.from('leads')
          .select('id,name,phone,source,created_at,contacted_at,pain_category,desired_outcome,metadata,status')
          .in('source', sourceKeys.length ? sourceKeys : ['exire_form'])
          .eq('tenant_id', tid)
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      const subs = (subsRes.data || []) as Array<{ id: string; form_id: string; lead_id: string | null }>;
      const totalSubmissions = subs.length;
      const totalSynced = subs.filter((s) => s.lead_id).length;
      const totalUnsynced = totalSubmissions - totalSynced;

      const leads = (leadsRes.data || []) as Array<{
        id: string; name: string; phone: string | null; source: string; created_at: string;
        contacted_at: string | null; pain_category: string | null; desired_outcome: string | null;
        metadata: Record<string, unknown> | null; status: string;
      }>;
      const leadsToday = leads.filter((l) => new Date(l.created_at) >= startOfDay).length;
      const awaitingFirstReply = leads.filter((l) => !l.contacted_at && l.status === 'new').length;
      const latest = leads.slice(0, 8).map((l) => ({
        id: l.id, name: l.name, phone: l.phone, source: l.source,
        created_at: l.created_at, contacted_at: l.contacted_at,
        pain_category: l.pain_category, desired_outcome: l.desired_outcome,
        form_title: (l.metadata?.form_title as string) || null,
      }));

      return { formIds, totalSubmissions, totalSynced, totalUnsynced, leadsToday, awaitingFirstReply, latest };
    },
  });
}
