/**
 * Shared XSYSTEM types.
 * Tables are referenced via string casts to keep this layer independent
 * from generated Supabase types until a regeneration is run.
 */
export interface XSysSession {
  id: string;
  client_id: string;
  practitioner_id: string;
  session_number: number | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  mode: string;
  status: string;
  summary: string | null;
  recording_audio_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface XSysSessionNote {
  id: string;
  session_id: string;
  client_id: string;
  practitioner_id: string;
  kind: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface XSysBelief {
  id: string;
  client_id: string;
  practitioner_id: string;
  belief: string;
  polarity: string;
  strength: number | null;
  source_session_id: string | null;
  status: string;
  reframe: string | null;
  evidence: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface XSysPattern {
  id: string;
  client_id: string;
  practitioner_id: string;
  name: string;
  description: string | null;
  trigger: string | null;
  loop: Record<string, unknown>;
  frequency: string | null;
  severity: number | null;
  status: string;
  linked_beliefs: string[];
  created_at: string;
  updated_at: string;
}

export interface XSysInnerPart {
  id: string;
  client_id: string;
  practitioner_id: string;
  name: string;
  role: string;
  voice: string | null;
  intent: string | null;
  age_origin: string | null;
  relationship_to_self: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface XSysRoom {
  id: string;
  practitioner_id: string;
  name: string;
  slug: string;
  description: string | null;
  intent: string | null;
  default_protocol_ids: string[];
  order_index: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface XSysClientRoom {
  id: string;
  client_id: string;
  practitioner_id: string;
  room_id: string;
  state: string;
  entered_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface XSysProtocol {
  id: string;
  practitioner_id: string;
  title: string;
  slug: string;
  category: string;
  body: string | null;
  steps: unknown[];
  default_duration_minutes: number | null;
  audio_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface XSysAudioAssignment {
  id: string;
  client_id: string;
  practitioner_id: string;
  audio_id: string;
  assigned_at: string;
  due_at: string | null;
  frequency: string;
  instructions: string | null;
  status: string;
  last_played_at: string | null;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export interface XSysCheckin {
  id: string;
  client_id: string;
  practitioner_id: string;
  kind: string;
  payload: Record<string, unknown>;
  mood: number | null;
  notes: string | null;
  form_submission_id: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface XSysFollowup {
  id: string;
  client_id: string;
  practitioner_id: string;
  title: string;
  body: string | null;
  due_at: string | null;
  priority: string;
  status: string;
  done_at: string | null;
  source: string;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}


export interface XSysPayment {
  id: string;
  client_id: string;
  practitioner_id: string;
  amount_cents: number;
  currency: string;
  kind: string;
  paid_at: string | null;
  method: string | null;
  external_ref: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
