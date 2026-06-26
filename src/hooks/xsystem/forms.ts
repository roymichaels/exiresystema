/**
 * Hook: load the practitioner's default intake form link (first published custom_form).
 * Returns null when there is no suitable form.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IntakeFormRef {
  id: string;
  title: string;
  access_token: string;
  url: string;
}

/**
 * Default intake form for the Exire landing thank-you state.
 * If a preferred id is supplied (e.g. from `exire_intake_form_id` admin
 * setting), we look it up first; otherwise we fall back to the most
 * recently published custom form.
 */
export function useDefaultIntakeForm(preferredId?: string | null) {
  const pref = (preferredId || '').trim();
  return useQuery({
    queryKey: ['xsystem', 'default_intake_form', pref || 'latest'],
    queryFn: async (): Promise<IntakeFormRef | null> => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      // 1. Preferred (admin-selected) form, if any.
      if (pref) {
        const { data } = await supabase
          .from('custom_forms' as any)
          .select('id,title,access_token,status')
          .eq('id', pref)
          .maybeSingle();
        const row = data as any;
        if (row?.access_token) {
          return {
            id: row.id, title: row.title, access_token: row.access_token,
            url: `${origin}/form/${row.access_token}`,
          };
        }
      }
      // 2. Latest published fallback.
      const { data, error } = await supabase
        .from('custom_forms' as any)
        .select('id,title,access_token,status,created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error || !data) return null;
      const row = data as any;
      return {
        id: row.id, title: row.title, access_token: row.access_token,
        url: `${origin}/form/${row.access_token}`,
      };
    },
  });
}

export function useAllPublishedForms() {
  return useQuery({
    queryKey: ['xsystem', 'all_intake_forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms' as any)
        .select('id,title,access_token,status')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return (data || []).map((r: any) => ({
        id: r.id, title: r.title, access_token: r.access_token,
        url: `${origin}/form/${r.access_token}`,
      }));
    },
  });
}
