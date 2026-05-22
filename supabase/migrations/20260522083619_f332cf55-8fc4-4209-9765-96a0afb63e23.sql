
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS landing_page_id uuid REFERENCES public.coach_landing_pages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.leads ALTER COLUMN phone DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_contact_present') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_contact_present
      CHECK (phone IS NOT NULL OR email IS NOT NULL);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_leads_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_leads_updated_at();

INSERT INTO public.leads (
  id, name, phone, email, source, status, notes, tags, metadata,
  landing_page_id, created_at, updated_at
)
SELECT
  cl.id, cl.name, cl.phone, cl.email,
  'landing_page'::text,
  CASE WHEN cl.status = 'qualified' THEN 'scheduled' ELSE COALESCE(cl.status, 'new') END,
  cl.notes, cl.tags, COALESCE(cl.metadata, '{}'::jsonb),
  cl.landing_page_id, cl.created_at, cl.updated_at
FROM public.coach_leads cl
WHERE NOT EXISTS (SELECT 1 FROM public.leads l WHERE l.id = cl.id);

INSERT INTO public.leads (
  id, name, phone, email, source, status, notes, contacted_at, created_at, metadata
)
SELECT
  eil.id,
  COALESCE(split_part(eil.email, '@', 1), 'Lead'),
  NULL, eil.email, 'exit_intent'::text,
  CASE WHEN eil.is_contacted THEN 'contacted' ELSE 'new' END,
  eil.notes, eil.contacted_at, eil.created_at,
  jsonb_build_object('imported_from', 'exit_intent_leads')
FROM public.exit_intent_leads eil
WHERE NOT EXISTS (SELECT 1 FROM public.leads l WHERE l.id = eil.id);

DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;

CREATE POLICY "Admins and practitioners can view leads"
  ON public.leads FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'practitioner'::app_role)
  );

CREATE POLICY "Admins and practitioners can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'practitioner'::app_role)
  );

CREATE POLICY "Admins and practitioners can delete leads"
  ON public.leads FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'practitioner'::app_role)
  );

DROP POLICY IF EXISTS "Authenticated can insert leads" ON public.leads;
CREATE POLICY "Authenticated can insert leads"
  ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
