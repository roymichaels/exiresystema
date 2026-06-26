/**
 * Exire funnel settings — stored as key/value rows in public.site_settings.
 * Anon may read (public landing). Admin may write (RLS enforced).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const EXIRE_KEYS = [
  'exire_landing_video_url',
  'exire_whatsapp_number',
  'exire_primary_cta_label',
  'exire_secondary_cta_label',
  'exire_intake_form_id',
] as const;
export type ExireKey = (typeof EXIRE_KEYS)[number];
export type ExireFunnelSettings = Record<ExireKey, string>;

const DEFAULTS: ExireFunnelSettings = {
  exire_landing_video_url: '',
  exire_whatsapp_number: '972500000000',
  exire_primary_cta_label: 'בדוק התאמה לתהליך',
  exire_secondary_cta_label: 'שלח לי פרטים בוואטסאפ',
  exire_intake_form_id: '',
};

export function useExireFunnelSettings() {
  return useQuery({
    queryKey: ['exire_funnel_settings'],
    staleTime: 60_000,
    queryFn: async (): Promise<ExireFunnelSettings> => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key,setting_value')
        .in('setting_key', EXIRE_KEYS as unknown as string[]);
      if (error) throw error;
      const out: ExireFunnelSettings = { ...DEFAULTS };
      for (const row of (data || []) as Array<{ setting_key: string; setting_value: string | null }>) {
        if ((EXIRE_KEYS as readonly string[]).includes(row.setting_key)) {
          (out as Record<string, string>)[row.setting_key] = row.setting_value || '';
        }
      }
      return out;
    },
  });
}

export function useUpdateExireFunnelSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<ExireFunnelSettings>) => {
      const rows = (Object.entries(patch) as Array<[ExireKey, string]>).map(([k, v]) => ({
        setting_key: k,
        setting_value: v ?? '',
        setting_type: 'text',
      }));
      if (!rows.length) return;
      const { error } = await supabase
        .from('site_settings')
        .upsert(rows as never, { onConflict: 'setting_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exire_funnel_settings'] });
    },
  });
}

/** Parse a VSL URL into an embeddable iframe src, or return null for plain mp4 / unknown. */
export function parseVideoEmbed(url: string): { type: 'iframe' | 'mp4' | 'none'; src: string } {
  const u = (url || '').trim();
  if (!u) return { type: 'none', src: '' };
  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./, '');
    // YouTube
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '');
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}?rel=0` };
    }
    if (host.endsWith('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/embed/')[1];
      if (id) return { type: 'iframe', src: `https://www.youtube.com/embed/${id}?rel=0` };
    }
    // Vimeo
    if (host.endsWith('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id) return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }
    // mp4 / webm
    if (/\.(mp4|webm|mov)$/i.test(parsed.pathname)) return { type: 'mp4', src: u };
    // Loom etc → just iframe original
    if (host.endsWith('loom.com')) return { type: 'iframe', src: u.replace('/share/', '/embed/') };
    return { type: 'iframe', src: u };
  } catch {
    return { type: 'none', src: '' };
  }
}
