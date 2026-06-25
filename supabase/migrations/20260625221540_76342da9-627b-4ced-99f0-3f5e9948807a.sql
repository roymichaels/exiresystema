
ALTER TABLE public.xsystem_followups ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.xsystem_payments ADD COLUMN IF NOT EXISTS due_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_xsystem_followups_lead_id ON public.xsystem_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_xsystem_followups_practitioner_status_due ON public.xsystem_followups(practitioner_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_xsystem_payments_practitioner_status_paid ON public.xsystem_payments(practitioner_id, status, paid_at);
CREATE INDEX IF NOT EXISTS idx_xsystem_sessions_practitioner_scheduled ON public.xsystem_sessions(practitioner_id, scheduled_at);
