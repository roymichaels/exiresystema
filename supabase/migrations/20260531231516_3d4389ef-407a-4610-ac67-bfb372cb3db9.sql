GRANT SELECT ON public.custom_forms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_forms TO authenticated;
GRANT ALL ON public.custom_forms TO service_role;

GRANT SELECT ON public.form_fields TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_fields TO authenticated;
GRANT ALL ON public.form_fields TO service_role;

GRANT INSERT ON public.form_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;