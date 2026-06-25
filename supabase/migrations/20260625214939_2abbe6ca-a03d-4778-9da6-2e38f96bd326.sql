
-- ============================================================
-- XSYSTEM Phase 2A — core schema
-- ============================================================

-- Shared updated_at trigger (idempotent)
CREATE OR REPLACE FUNCTION public.xsystem_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 1. xsystem_sessions
-- ============================================================
CREATE TABLE public.xsystem_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  session_number int,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  duration_minutes int,
  mode text DEFAULT 'in_person',
  status text NOT NULL DEFAULT 'scheduled',
  summary text,
  recording_audio_id uuid REFERENCES public.hypnosis_audios(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_sessions TO authenticated;
GRANT ALL ON public.xsystem_sessions TO service_role;
ALTER TABLE public.xsystem_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_sessions_owner_all" ON public.xsystem_sessions
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_sessions_client ON public.xsystem_sessions(client_id);
CREATE INDEX idx_xsys_sessions_pract ON public.xsystem_sessions(practitioner_id);
CREATE INDEX idx_xsys_sessions_scheduled ON public.xsystem_sessions(scheduled_at);
CREATE TRIGGER trg_xsys_sessions_touch BEFORE UPDATE ON public.xsystem_sessions
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 2. xsystem_session_notes
-- ============================================================
CREATE TABLE public.xsystem_session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.xsystem_sessions(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'observation',
  body text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_session_notes TO authenticated;
GRANT ALL ON public.xsystem_session_notes TO service_role;
ALTER TABLE public.xsystem_session_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_session_notes_owner_all" ON public.xsystem_session_notes
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_notes_session ON public.xsystem_session_notes(session_id);
CREATE INDEX idx_xsys_notes_client ON public.xsystem_session_notes(client_id);
CREATE TRIGGER trg_xsys_notes_touch BEFORE UPDATE ON public.xsystem_session_notes
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 3. xsystem_beliefs
-- ============================================================
CREATE TABLE public.xsystem_beliefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  belief text NOT NULL,
  polarity text NOT NULL DEFAULT 'limiting',
  strength int CHECK (strength BETWEEN 1 AND 10),
  source_session_id uuid REFERENCES public.xsystem_sessions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  reframe text,
  evidence jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_beliefs TO authenticated;
GRANT ALL ON public.xsystem_beliefs TO service_role;
ALTER TABLE public.xsystem_beliefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_beliefs_owner_all" ON public.xsystem_beliefs
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_beliefs_client ON public.xsystem_beliefs(client_id);
CREATE TRIGGER trg_xsys_beliefs_touch BEFORE UPDATE ON public.xsystem_beliefs
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 4. xsystem_patterns
-- ============================================================
CREATE TABLE public.xsystem_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  trigger text,
  loop jsonb DEFAULT '{}'::jsonb,
  frequency text,
  severity int CHECK (severity BETWEEN 1 AND 10),
  status text NOT NULL DEFAULT 'active',
  linked_beliefs uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_patterns TO authenticated;
GRANT ALL ON public.xsystem_patterns TO service_role;
ALTER TABLE public.xsystem_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_patterns_owner_all" ON public.xsystem_patterns
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_patterns_client ON public.xsystem_patterns(client_id);
CREATE TRIGGER trg_xsys_patterns_touch BEFORE UPDATE ON public.xsystem_patterns
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 5. xsystem_inner_parts
-- ============================================================
CREATE TABLE public.xsystem_inner_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'protector',
  voice text,
  intent text,
  age_origin text,
  relationship_to_self text,
  status text NOT NULL DEFAULT 'unblended',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_inner_parts TO authenticated;
GRANT ALL ON public.xsystem_inner_parts TO service_role;
ALTER TABLE public.xsystem_inner_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_parts_owner_all" ON public.xsystem_inner_parts
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_parts_client ON public.xsystem_inner_parts(client_id);
CREATE TRIGGER trg_xsys_parts_touch BEFORE UPDATE ON public.xsystem_inner_parts
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 6. xsystem_rooms (practitioner-scoped templates)
-- ============================================================
CREATE TABLE public.xsystem_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  intent text,
  default_protocol_ids uuid[] DEFAULT '{}',
  order_index int NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (practitioner_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_rooms TO authenticated;
GRANT ALL ON public.xsystem_rooms TO service_role;
ALTER TABLE public.xsystem_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_rooms_owner_all" ON public.xsystem_rooms
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_rooms_pract ON public.xsystem_rooms(practitioner_id);
CREATE TRIGGER trg_xsys_rooms_touch BEFORE UPDATE ON public.xsystem_rooms
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 7. xsystem_client_rooms
-- ============================================================
CREATE TABLE public.xsystem_client_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  room_id uuid NOT NULL REFERENCES public.xsystem_rooms(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'locked',
  entered_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, room_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_client_rooms TO authenticated;
GRANT ALL ON public.xsystem_client_rooms TO service_role;
ALTER TABLE public.xsystem_client_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_client_rooms_owner_all" ON public.xsystem_client_rooms
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_client_rooms_client ON public.xsystem_client_rooms(client_id);
CREATE TRIGGER trg_xsys_client_rooms_touch BEFORE UPDATE ON public.xsystem_client_rooms
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 8. xsystem_protocols
-- ============================================================
CREATE TABLE public.xsystem_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  category text NOT NULL DEFAULT 'reframe',
  body text,
  steps jsonb DEFAULT '[]'::jsonb,
  default_duration_minutes int,
  audio_id uuid REFERENCES public.hypnosis_audios(id) ON DELETE SET NULL,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (practitioner_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_protocols TO authenticated;
GRANT ALL ON public.xsystem_protocols TO service_role;
ALTER TABLE public.xsystem_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_protocols_owner_all" ON public.xsystem_protocols
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_protocols_pract ON public.xsystem_protocols(practitioner_id);
CREATE TRIGGER trg_xsys_protocols_touch BEFORE UPDATE ON public.xsystem_protocols
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 9. xsystem_session_protocols
-- ============================================================
CREATE TABLE public.xsystem_session_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.xsystem_sessions(id) ON DELETE CASCADE,
  protocol_id uuid NOT NULL REFERENCES public.xsystem_protocols(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  outcome text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_session_protocols TO authenticated;
GRANT ALL ON public.xsystem_session_protocols TO service_role;
ALTER TABLE public.xsystem_session_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_sp_owner_all" ON public.xsystem_session_protocols
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_sp_session ON public.xsystem_session_protocols(session_id);
CREATE INDEX idx_xsys_sp_client ON public.xsystem_session_protocols(client_id);
CREATE TRIGGER trg_xsys_sp_touch BEFORE UPDATE ON public.xsystem_session_protocols
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 10. xsystem_audio_assignments
-- ============================================================
CREATE TABLE public.xsystem_audio_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  audio_id uuid NOT NULL REFERENCES public.hypnosis_audios(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  frequency text NOT NULL DEFAULT 'daily',
  instructions text,
  status text NOT NULL DEFAULT 'active',
  last_played_at timestamptz,
  play_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_audio_assignments TO authenticated;
GRANT ALL ON public.xsystem_audio_assignments TO service_role;
ALTER TABLE public.xsystem_audio_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_audio_owner_all" ON public.xsystem_audio_assignments
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_audio_client ON public.xsystem_audio_assignments(client_id);
CREATE TRIGGER trg_xsys_audio_touch BEFORE UPDATE ON public.xsystem_audio_assignments
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 11. xsystem_checkins
-- ============================================================
CREATE TABLE public.xsystem_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'mood',
  payload jsonb DEFAULT '{}'::jsonb,
  mood int CHECK (mood BETWEEN 1 AND 10),
  notes text,
  form_submission_id uuid REFERENCES public.form_submissions(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_checkins TO authenticated;
GRANT ALL ON public.xsystem_checkins TO service_role;
ALTER TABLE public.xsystem_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_checkins_owner_all" ON public.xsystem_checkins
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_checkins_client ON public.xsystem_checkins(client_id);
CREATE INDEX idx_xsys_checkins_submitted ON public.xsystem_checkins(submitted_at);
CREATE TRIGGER trg_xsys_checkins_touch BEFORE UPDATE ON public.xsystem_checkins
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 12. xsystem_followups
-- ============================================================
CREATE TABLE public.xsystem_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  due_at timestamptz,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  done_at timestamptz,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_followups TO authenticated;
GRANT ALL ON public.xsystem_followups TO service_role;
ALTER TABLE public.xsystem_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_followups_owner_all" ON public.xsystem_followups
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_followups_client ON public.xsystem_followups(client_id);
CREATE INDEX idx_xsys_followups_due ON public.xsystem_followups(due_at);
CREATE TRIGGER trg_xsys_followups_touch BEFORE UPDATE ON public.xsystem_followups
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- 13. xsystem_payments
-- ============================================================
CREATE TABLE public.xsystem_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL,
  amount_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ILS',
  kind text NOT NULL DEFAULT 'session',
  paid_at timestamptz,
  method text,
  external_ref text,
  notes text,
  status text NOT NULL DEFAULT 'paid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_payments TO authenticated;
GRANT ALL ON public.xsystem_payments TO service_role;
ALTER TABLE public.xsystem_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xsys_payments_owner_all" ON public.xsystem_payments
  FOR ALL TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());
CREATE INDEX idx_xsys_payments_client ON public.xsystem_payments(client_id);
CREATE TRIGGER trg_xsys_payments_touch BEFORE UPDATE ON public.xsystem_payments
  FOR EACH ROW EXECUTE FUNCTION public.xsystem_touch_updated_at();

-- ============================================================
-- form_submissions: add client linkage (nullable, additive)
-- ============================================================
ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS practitioner_id uuid;
CREATE INDEX IF NOT EXISTS idx_form_submissions_client ON public.form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_practitioner ON public.form_submissions(practitioner_id);

-- ============================================================
-- Seed default rooms + protocols per existing practitioner
-- ============================================================
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT DISTINCT practitioner_id FROM public.clients WHERE practitioner_id IS NOT NULL
  LOOP
    -- Rooms
    INSERT INTO public.xsystem_rooms (practitioner_id, name, slug, description, intent, order_index)
    VALUES
      (pid, 'חדר האמונות', 'beliefs', 'עיבוד אמונות מגבילות והחלפתן באמונות מעצימות.', 'מיפוי ושחרור אמונות יסוד', 1),
      (pid, 'חדר הרגש והאנרגיה', 'emotion-energy', 'שחרור רגשי ושיקום זרימת אנרגיה.', 'ויסות רגשי', 2),
      (pid, 'חדר החלקים הפנימיים', 'inner-parts', 'דיאלוג עם חלקים פנימיים בגישת IFS.', 'אינטגרציה של חלקים', 3),
      (pid, 'חדר הזמן והזיכרונות', 'time-memories', 'ריפרוז של זיכרונות מעצבים.', 'ריפרוז ביוגרפי', 4),
      (pid, 'הים המרכזי / מרכז אנרגטי', 'central-sea', 'אינטגרציה כוללת ומרכוז.', 'איזון ומרכוז', 5)
    ON CONFLICT (practitioner_id, slug) DO NOTHING;

    -- Protocols
    INSERT INTO public.xsystem_protocols (practitioner_id, title, slug, category, body, default_duration_minutes)
    VALUES
      (pid, 'אינדוקציית המראה', 'mirror-induction', 'induction', 'אינדוקציה דרך התבוננות במראה פנימית.', 10),
      (pid, 'ירידה בעשר המדרגות', 'ten-stairs-descent', 'induction', 'העמקת טראנס דרך ירידה הדרגתית.', 8),
      (pid, 'כניסה למסדרון', 'hallway-entry', 'induction', 'מעבר לסביבת העבודה התת־מודעת.', 5),
      (pid, 'תהליך חדר האמונות', 'beliefs-room-process', 'reframe', 'מיפוי, אתגור והחלפה של אמונה מגבילה.', 25),
      (pid, 'דיאלוג חלקים פנימיים', 'inner-parts-dialogue', 'parts_work', 'שיחה מתווכת בין חלקים פנימיים.', 30),
      (pid, 'חדר שחרור רגשי', 'emotional-release-room', 'integration', 'עיבוד ושחרור מטענים רגשיים.', 25),
      (pid, 'ריפרוז זמן וזיכרון', 'time-memory-reframe', 'regression', 'חזרה לזיכרון מעצב ותיקונו.', 30),
      (pid, 'אינטגרציית הים המרכזי', 'central-sea-integration', 'integration', 'איסוף וקיבוע השינוי.', 15),
      (pid, 'התקנת עצמי עתידי', 'future-self-installation', 'anchoring', 'יצירת ועיגון של עצמי עתידי.', 20),
      (pid, 'אינטגרציית הקלטה אישית', 'personalized-audio-integration', 'homework', 'שיוך והנחיות לשימוש בהקלטה אישית.', 0)
    ON CONFLICT (practitioner_id, slug) DO NOTHING;
  END LOOP;
END$$;
