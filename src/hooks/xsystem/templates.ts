/**
 * XSYSTEM message templates — per-practitioner WhatsApp/email/internal snippets.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type MsgChannel = 'whatsapp' | 'email' | 'internal';
export type MsgCategory =
  | 'lead_reply' | 'onboarding' | 'followup' | 'session_prep'
  | 'post_session' | 'payment' | 'checkin' | 'audio_assignment';

export interface XSysMessageTemplate {
  id: string;
  practitioner_id: string;
  name: string;
  channel: MsgChannel;
  category: MsgCategory;
  subject: string | null;
  body: string;
  variables: string[];
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

const TABLE = 'xsystem_message_templates';

export function useXSystemMessageTemplates(opts?: {
  channel?: MsgChannel; category?: MsgCategory; includeArchived?: boolean;
}) {
  const { user } = useAuth();
  const channel = opts?.channel;
  const category = opts?.category;
  const includeArchived = !!opts?.includeArchived;
  return useQuery({
    queryKey: ['xsystem', 'msg_templates', user?.id, channel, category, includeArchived],
    enabled: !!user?.id,
    queryFn: async () => {
      let q = supabase.from(TABLE as any).select('*').eq('practitioner_id', user!.id);
      if (channel) q = q.eq('channel', channel);
      if (category) q = q.eq('category', category);
      if (!includeArchived) q = q.eq('is_archived', false);
      const { data, error } = await q.order('is_default', { ascending: false }).order('name');
      if (error) throw error;
      return (data || []) as unknown as XSysMessageTemplate[];
    },
  });
}

export function useCreateXSystemMessageTemplate() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<XSysMessageTemplate> & { name: string; body: string; channel: MsgChannel; category: MsgCategory }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from(TABLE as any)
        .insert({ ...input, practitioner_id: user.id, variables: input.variables ?? [] } as any)
        .select('*').single();
      if (error) throw error;
      return data as unknown as XSysMessageTemplate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'msg_templates'] });
      toast({ title: 'תבנית נשמרה' });
    },
    onError: (e: any) => toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateXSystemMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<XSysMessageTemplate> }) => {
      const { data, error } = await supabase
        .from(TABLE as any).update(updates as any).eq('id', id).select('*').single();
      if (error) throw error;
      return data as unknown as XSysMessageTemplate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'msg_templates'] });
      toast({ title: 'עודכן' });
    },
    onError: (e: any) => toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

/** Simple {{var}} replacer. Unmatched variables remain visible so the user notices. */
export function renderTemplate(body: string, vars: Record<string, string | undefined | null>): string {
  return body.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_m, key: string) => {
    const v = vars[key];
    return v == null || v === '' ? `{{${key}}}` : String(v);
  });
}

/** Extract variable names referenced in a template body. */
export function extractTemplateVars(body: string): string[] {
  const set = new Set<string>();
  for (const m of body.matchAll(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g)) set.add(m[1]);
  return [...set];
}
