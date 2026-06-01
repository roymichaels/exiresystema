DO $$
DECLARE
  s RECORD;
  f RECORD;
  new_resp JSONB;
  v JSONB;
BEGIN
  FOR s IN SELECT id, form_id, responses FROM public.form_submissions WHERE responses IS NOT NULL LOOP
    new_resp := '{}'::jsonb;
    FOR f IN SELECT id, label FROM public.form_fields WHERE form_id = s.form_id LOOP
      -- if already keyed by id, keep it; otherwise look up by label
      IF s.responses ? f.id::text THEN
        v := s.responses -> f.id::text;
      ELSIF s.responses ? f.label THEN
        v := s.responses -> f.label;
      ELSE
        v := 'null'::jsonb;
      END IF;
      new_resp := new_resp || jsonb_build_object(f.id::text, v);
    END LOOP;
    UPDATE public.form_submissions SET responses = new_resp WHERE id = s.id;
  END LOOP;
END $$;