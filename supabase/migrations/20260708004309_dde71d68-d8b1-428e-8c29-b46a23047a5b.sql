
ALTER TABLE public.custom_forms ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tenant_id uuid;
CREATE INDEX IF NOT EXISTS idx_custom_forms_tenant ON public.custom_forms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant ON public.form_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON public.leads(tenant_id);
