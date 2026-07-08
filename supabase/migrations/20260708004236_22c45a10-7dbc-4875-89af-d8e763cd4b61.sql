
-- Restore public read access for published forms (needed for /form/:token public page)
GRANT SELECT ON public.custom_forms TO anon, authenticated;
GRANT SELECT ON public.form_fields TO anon, authenticated;
GRANT INSERT ON public.form_submissions TO anon, authenticated;

CREATE POLICY "Anyone can view published forms"
ON public.custom_forms
FOR SELECT
USING (status = 'published');
