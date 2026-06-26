
-- Phase 2K: Exire Lead Form mappings + form_submissions sync columns

CREATE TABLE IF NOT EXISTS public.xsystem_lead_form_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL,
  form_id uuid NOT NULL,
  source_key text NOT NULL DEFAULT 'exire_form',
  is_active boolean NOT NULL DEFAULT true,
  auto_sync boolean NOT NULL DEFAULT true,
  create_followup boolean NOT NULL DEFAULT true,
  field_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] NOT NULL DEFAULT ARRAY['exire','form_submission'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (practitioner_id, form_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.xsystem_lead_form_mappings TO authenticated;
GRANT ALL ON public.xsystem_lead_form_mappings TO service_role;

ALTER TABLE public.xsystem_lead_form_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practitioner manages own mappings"
  ON public.xsystem_lead_form_mappings FOR ALL
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at_lead_form_mappings()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_lead_form_mappings_updated ON public.xsystem_lead_form_mappings;
CREATE TRIGGER trg_lead_form_mappings_updated
  BEFORE UPDATE ON public.xsystem_lead_form_mappings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_lead_form_mappings();

-- Extend form_submissions with sync-back columns (safe / idempotent)
ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS lead_id uuid,
  ADD COLUMN IF NOT EXISTS synced_to_lead_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_form_submissions_lead_id
  ON public.form_submissions(lead_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_synced
  ON public.form_submissions(form_id, synced_to_lead_at);
