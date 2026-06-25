import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

// ---- Beliefs ----
const beliefs = createClientScopedHooks<XSysBelief>({
  table: 'xsystem_beliefs',
  domain: 'beliefs',
});
export const useXSystemBeliefs = beliefs.useList;
export const useXSystemBeliefsCount = beliefs.useCount;
export const useCreateXSystemBelief = beliefs.useCreate;

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

// ---- Inner parts ----
const parts = createClientScopedHooks<XSysInnerPart>({
  table: 'xsystem_inner_parts',
  domain: 'inner_parts',
});
export const useXSystemInnerParts = parts.useList;
export const useXSystemInnerPartsCount = parts.useCount;
export const useCreateXSystemInnerPart = parts.useCreate;

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

// ---- Check-ins ----
const checkins = createClientScopedHooks<XSysCheckin>({
  table: 'xsystem_checkins',
  domain: 'checkins',
  orderColumn: 'submitted_at',
});
export const useXSystemCheckins = checkins.useList;
export const useXSystemCheckinsCount = checkins.useCount;
export const useCreateXSystemCheckin = checkins.useCreate;

// ---- Follow-ups ----
const followups = createClientScopedHooks<XSysFollowup>({
  table: 'xsystem_followups',
  domain: 'followups',
});
export const useXSystemFollowups = followups.useList;
export const useCreateXSystemFollowup = followups.useCreate;

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

// ---- Payments ----
const payments = createClientScopedHooks<XSysPayment>({
  table: 'xsystem_payments',
  domain: 'payments',
  orderColumn: 'paid_at',
});
export const useXSystemPayments = payments.useList;
export const useXSystemPaymentsCount = payments.useCount;
export const useCreateXSystemPayment = payments.useCreate;

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
