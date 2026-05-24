
-- Coach singleton settings (admin = sole coach)
CREATE TABLE IF NOT EXISTS public.coach_integrations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  twilio_from TEXT,
  twilio_whatsapp_from TEXT,
  default_calendar_id TEXT DEFAULT 'primary',
  default_session_duration_min INT DEFAULT 60,
  default_session_price_usd NUMERIC DEFAULT 150,
  stripe_session_price_id TEXT,
  email_from TEXT,
  email_signature TEXT,
  brand_color TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can manage own integrations"
  ON public.coach_integrations FOR ALL
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'practitioner')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'practitioner')
  );

CREATE TRIGGER set_coach_integrations_updated_at
  BEFORE UPDATE ON public.coach_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activity log for leads & clients (outbound messages, calls, bookings, notes)
CREATE TABLE IF NOT EXISTS public.lead_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  client_user_id UUID,
  kind TEXT NOT NULL CHECK (kind IN ('whatsapp','sms','email','call','note','booking','payment')),
  direction TEXT DEFAULT 'outbound' CHECK (direction IN ('outbound','inbound','system')),
  subject TEXT,
  body TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'sent',
  external_id TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON public.lead_activity (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activity_client ON public.lead_activity (client_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activity_kind ON public.lead_activity (kind, created_at DESC);

ALTER TABLE public.lead_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach/admin can read all activity"
  ON public.lead_activity FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'practitioner')
  );

CREATE POLICY "Coach/admin can insert activity"
  ON public.lead_activity FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'practitioner')
  );

CREATE POLICY "Coach/admin can update activity"
  ON public.lead_activity FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'practitioner')
  );

CREATE POLICY "Coach/admin can delete activity"
  ON public.lead_activity FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'practitioner')
  );
