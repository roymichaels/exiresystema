import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { createClientScopedHooks } from './_factory';
import type {
  XSysBelief,
  XSysCheckin,
  XSysFollowup,
  XSysInnerPart,
  XSysPattern,
  XSysPayment,
  XSysSession,
  XSysSessionNote,
  XSysAudioAssignment,
  XSysClientRoom,
  XSysProtocol,
  XSysRoom,
} from './types';

export * from './types';

// ---- Sessions (ordered by scheduled_at desc) ----
const sessions = createClientScopedHooks<XSysSession>({
  table: 'xsystem_sessions',
  domain: 'sessions',
  orderColumn: 'scheduled_at',
  ascending: false,
});
export const useXSystemSessions = sessions.useList;
export const useXSystemSessionsCount = sessions.useCount;
export const useCreateXSystemSession = sessions.useCreate;
export const useUpdateXSystemSession = sessions.useUpdate;

export function useXSystemNextSession(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'sessions', 'next', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_sessions' as any)
        .select('*')
        .eq('client_id', clientId!)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data || null) as unknown as XSysSession | null;
    },
  });
}

// ---- Session notes (need a session_id, not client_id — separate impl) ----
export function useXSystemSessionNotes(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'session_notes', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_session_notes' as any)
        .select('*')
        .eq('session_id', sessionId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as XSysSessionNote[];
    },
  });
}

export function useCreateXSystemSessionNote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      session_id: string;
      client_id: string;
      kind: string;
      body: string;
      tags?: string[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('xsystem_session_notes' as any)
        .insert({ ...input, practitioner_id: user.id, tags: input.tags ?? [] } as any)
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as XSysSessionNote;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'session_notes', row.session_id] });
      toast({ title: 'נשמר' });
    },
    onError: (e: any) =>
      toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

// ---- Beliefs ----
const beliefs = createClientScopedHooks<XSysBelief>({
  table: 'xsystem_beliefs',
  domain: 'beliefs',
});
export const useXSystemBeliefs = beliefs.useList;
export const useXSystemBeliefsCount = beliefs.useCount;
export const useCreateXSystemBelief = beliefs.useCreate;
export const useUpdateXSystemBelief = beliefs.useUpdate;

export function useXSystemActiveBeliefsCount(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'beliefs', 'active-count', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('xsystem_beliefs' as any)
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId!)
        .eq('status', 'active');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

// ---- Patterns ----
const patterns = createClientScopedHooks<XSysPattern>({
  table: 'xsystem_patterns',
  domain: 'patterns',
});
export const useXSystemPatterns = patterns.useList;
export const useXSystemPatternsCount = patterns.useCount;
export const useCreateXSystemPattern = patterns.useCreate;
export const useUpdateXSystemPattern = patterns.useUpdate;

// ---- Inner parts ----
const parts = createClientScopedHooks<XSysInnerPart>({
  table: 'xsystem_inner_parts',
  domain: 'inner_parts',
});
export const useXSystemInnerParts = parts.useList;
export const useXSystemInnerPartsCount = parts.useCount;
export const useCreateXSystemInnerPart = parts.useCreate;
export const useUpdateXSystemInnerPart = parts.useUpdate;

// ---- Rooms (practitioner-scoped templates) ----
export function useXSystemRooms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['xsystem', 'rooms', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_rooms' as any)
        .select('*')
        .eq('practitioner_id', user!.id)
        .eq('is_archived', false)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as XSysRoom[];
    },
  });
}

// ---- Client rooms ----
const clientRooms = createClientScopedHooks<XSysClientRoom>({
  table: 'xsystem_client_rooms',
  domain: 'client_rooms',
});
export const useXSystemClientRooms = clientRooms.useList;
export const useXSystemClientRoomsCount = clientRooms.useCount;
export const useUpsertXSystemClientRoom = clientRooms.useCreate;
export const useUpdateXSystemClientRoom = clientRooms.useUpdate;

// ---- Session protocols (applying a protocol within a session) ----
export function useXSystemSessionProtocols(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'session_protocols', 'session', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_session_protocols' as any)
        .select('*, xsystem_protocols(title, category)')
        .eq('session_id', sessionId!)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        session_id: string;
        protocol_id: string;
        client_id: string;
        order_index: number;
        outcome: string | null;
        notes: string | null;
        xsystem_protocols?: { title: string; category: string } | null;
      }>;
    },
  });
}

export function useXSystemClientProtocolApplications(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'session_protocols', 'client', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_session_protocols' as any)
        .select('*, xsystem_protocols(title, category), xsystem_sessions(session_number, scheduled_at)')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        session_id: string;
        protocol_id: string;
        client_id: string;
        outcome: string | null;
        notes: string | null;
        created_at: string;
        xsystem_protocols?: { title: string; category: string } | null;
        xsystem_sessions?: { session_number: number | null; scheduled_at: string | null } | null;
      }>;
    },
  });
}

export function useApplyXSystemProtocol() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      session_id: string;
      client_id: string;
      protocol_id: string;
      outcome?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('xsystem_session_protocols' as any)
        .insert({ ...input, practitioner_id: user.id } as any)
        .select('*')
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (row: any) => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'session_protocols', 'session', row.session_id] });
      qc.invalidateQueries({ queryKey: ['xsystem', 'session_protocols', 'client', row.client_id] });
      toast({ title: 'הפרוטוקול הוחל' });
    },
    onError: (e: any) =>
      toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

// ---- Protocols (practitioner-scoped catalog) ----
export function useXSystemProtocols() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['xsystem', 'protocols', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_protocols' as any)
        .select('*')
        .eq('practitioner_id', user!.id)
        .eq('is_archived', false)
        .order('title', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as XSysProtocol[];
    },
  });
}

// ---- Audio assignments ----
const audio = createClientScopedHooks<XSysAudioAssignment>({
  table: 'xsystem_audio_assignments',
  domain: 'audio_assignments',
  orderColumn: 'assigned_at',
});
export const useXSystemAudioAssignments = audio.useList;
export const useXSystemAudioAssignmentsCount = audio.useCount;
export const useCreateXSystemAudioAssignment = audio.useCreate;
export const useUpdateXSystemAudioAssignment = audio.useUpdate;

// Hypnosis audio library lookup (used to assign existing audios)
export function useHypnosisAudiosLibrary() {
  return useQuery({
    queryKey: ['hypnosis_audios', 'library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hypnosis_audios' as any)
        .select('id,title,description,duration_seconds,file_path,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        title: string;
        description: string | null;
        duration_seconds: number | null;
        file_path: string;
        created_at: string;
      }>;
    },
  });
}

// ---- Check-ins ----
const checkins = createClientScopedHooks<XSysCheckin>({
  table: 'xsystem_checkins',
  domain: 'checkins',
  orderColumn: 'submitted_at',
});
export const useXSystemCheckins = checkins.useList;
export const useXSystemCheckinsCount = checkins.useCount;
export const useCreateXSystemCheckin = checkins.useCreate;
export const useUpdateXSystemCheckin = checkins.useUpdate;

// ---- Follow-ups ----
const followups = createClientScopedHooks<XSysFollowup>({
  table: 'xsystem_followups',
  domain: 'followups',
});
export const useXSystemFollowups = followups.useList;
export const useCreateXSystemFollowup = followups.useCreate;
export const useUpdateXSystemFollowup = followups.useUpdate;

export function useXSystemOpenFollowupsCount(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'followups', 'open-count', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('xsystem_followups' as any)
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId!)
        .eq('status', 'open');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

// Lead-scoped follow-ups (used from Lead row)
export function useXSystemLeadFollowups(leadId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'followups', 'lead', leadId],
    enabled: !!leadId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_followups' as any)
        .select('*')
        .eq('lead_id', leadId!)
        .order('due_at', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data || []) as unknown as XSysFollowup[];
    },
  });
}

export function useCreateXSystemLeadFollowup() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      lead_id: string;
      title: string;
      body?: string | null;
      due_at?: string | null;
      priority?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('xsystem_followups' as any)
        .insert({
          practitioner_id: user.id,
          client_id: null,
          lead_id: input.lead_id,
          title: input.title,
          body: input.body ?? null,
          due_at: input.due_at ?? null,
          priority: input.priority ?? 'normal',
          source: 'manual',
          status: 'open',
        } as any)
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as XSysFollowup;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'followups', 'lead', row.lead_id] });
      qc.invalidateQueries({ queryKey: ['xsystem', 'dashboard'] });
      toast({ title: 'פולואפ נוצר' });
    },
    onError: (e: any) =>
      toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

// ---- Payments ----
const payments = createClientScopedHooks<XSysPayment>({
  table: 'xsystem_payments',
  domain: 'payments',
  orderColumn: 'paid_at',
});
export const useXSystemPayments = payments.useList;
export const useXSystemPaymentsCount = payments.useCount;
export const useCreateXSystemPayment = payments.useCreate;
export const useUpdateXSystemPayment = payments.useUpdate;

export function useXSystemPaymentsTotal(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'payments', 'total', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_payments' as any)
        .select('amount_cents,currency,status')
        .eq('client_id', clientId!)
        .eq('status', 'paid');
      if (error) throw error;
      const rows = ((data || []) as unknown) as Array<{ amount_cents: number; currency: string }>;
      const totalCents = rows.reduce((s, r) => s + (r.amount_cents || 0), 0);
      const currency = rows[0]?.currency || 'ILS';
      return { totalCents, currency, count: rows.length };
    },
  });
}

export function useXSystemClientPendingPayments(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'payments', 'pending', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_payments' as any)
        .select('amount_cents,currency,status')
        .eq('client_id', clientId!)
        .eq('status', 'pending');
      if (error) throw error;
      const rows = (data || []) as Array<{ amount_cents: number; currency: string }>;
      const totalCents = rows.reduce((s, r) => s + (r.amount_cents || 0), 0);
      return { totalCents, currency: rows[0]?.currency || 'ILS', count: rows.length };
    },
  });
}

// ---- Next follow-up for a client ----
export function useXSystemNextFollowup(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'followups', 'next', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_followups' as any)
        .select('*')
        .eq('client_id', clientId!)
        .eq('status', 'open')
        .order('due_at', { ascending: true, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data || null) as unknown as XSysFollowup | null;
    },
  });
}

// ---- Last check-in for client ----
export function useXSystemLastCheckin(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'checkins', 'last', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xsystem_checkins' as any)
        .select('*')
        .eq('client_id', clientId!)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data || null) as unknown as XSysCheckin | null;
    },
  });
}

// ---- Client form submissions ----
export function useClientFormSubmissions(clientId: string | undefined) {
  return useQuery({
    queryKey: ['xsystem', 'form_submissions', 'client', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions' as any)
        .select('id,form_id,responses,submitted_at,email,status,custom_forms(title)')
        .eq('client_id', clientId!)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        form_id: string;
        responses: Record<string, unknown>;
        submitted_at: string;
        email: string | null;
        status: string;
        custom_forms?: { title: string } | null;
      }>;
    },
  });
}

export function usePractitionerUnattachedSubmissions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['xsystem', 'form_submissions', 'unattached', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions' as any)
        .select('id,form_id,submitted_at,email,custom_forms(title)')
        .is('client_id', null)
        .order('submitted_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        form_id: string;
        submitted_at: string;
        email: string | null;
        custom_forms?: { title: string } | null;
      }>;
    },
  });
}

export function useAttachFormSubmissionToClient() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ submissionId, clientId }: { submissionId: string; clientId: string }) => {
      const patch: any = { client_id: clientId };
      if (user?.id) patch.practitioner_id = user.id;
      const { error } = await supabase
        .from('form_submissions' as any)
        .update(patch)
        .eq('id', submissionId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['xsystem', 'form_submissions', 'client', vars.clientId] });
      qc.invalidateQueries({ queryKey: ['xsystem', 'form_submissions', 'unattached'] });
      toast({ title: 'הטופס שויך' });
    },
    onError: (e: any) =>
      toast({ title: 'שגיאה', description: e.message, variant: 'destructive' }),
  });
}

