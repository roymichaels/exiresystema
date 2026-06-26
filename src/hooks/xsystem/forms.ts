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

export function useDefaultIntakeForm() {
  return useQuery({
    queryKey: ['xsystem', 'default_intake_form'],
    queryFn: async (): Promise<IntakeFormRef | null> => {
      const { data, error } = await supabase
        .from('custom_forms' as any)
        .select('id,title,access_token,status,created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      if (!data) return null;
      const row = data as any;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return {
        id: row.id,
        title: row.title,
        access_token: row.access_token,
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
