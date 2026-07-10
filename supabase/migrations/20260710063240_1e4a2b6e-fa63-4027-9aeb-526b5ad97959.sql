-- Restore legacy forms/submissions that were created before tenant ownership was enforced.
UPDATE public.custom_forms
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

UPDATE public.form_submissions AS fs
SET tenant_id = COALESCE(cf.tenant_id, '00000000-0000-0000-0000-000000000001'::uuid)
FROM public.custom_forms AS cf
WHERE fs.form_id = cf.id
  AND fs.tenant_id IS NULL;

UPDATE public.form_submissions
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- Prevent future records from being saved without a tenant association.
CREATE OR REPLACE FUNCTION public.assign_form_tenant_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_tenant_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  resolved_tenant_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'custom_forms' THEN
    IF NEW.tenant_id IS NULL THEN
      NEW.tenant_id := default_tenant_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'form_submissions' THEN
    IF NEW.tenant_id IS NULL THEN
      SELECT tenant_id
      INTO resolved_tenant_id
      FROM public.custom_forms
      WHERE id = NEW.form_id;

      NEW.tenant_id := COALESCE(resolved_tenant_id, default_tenant_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_custom_forms_tenant_id ON public.custom_forms;
CREATE TRIGGER trg_assign_custom_forms_tenant_id
BEFORE INSERT OR UPDATE OF tenant_id ON public.custom_forms
FOR EACH ROW
EXECUTE FUNCTION public.assign_form_tenant_id();

DROP TRIGGER IF EXISTS trg_assign_form_submissions_tenant_id ON public.form_submissions;
CREATE TRIGGER trg_assign_form_submissions_tenant_id
BEFORE INSERT OR UPDATE OF tenant_id, form_id ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.assign_form_tenant_id();

-- Security hardening: convert broad "logged-in user" gates into restrictive gates.
DROP POLICY IF EXISTS "Block anonymous notification access" ON public.admin_notifications;
CREATE POLICY "Authenticated notification access gate"
ON public.admin_notifications
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Block anonymous purchase access" ON public.content_purchases;
CREATE POLICY "Authenticated purchase access gate"
ON public.content_purchases
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Block anonymous enrollment access" ON public.course_enrollments;
CREATE POLICY "Authenticated enrollment access gate"
ON public.course_enrollments
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);