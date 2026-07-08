GRANT SELECT, INSERT ON public.form_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;