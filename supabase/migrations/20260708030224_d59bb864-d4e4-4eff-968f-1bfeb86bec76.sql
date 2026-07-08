
-- 1) Trigger: notify form owner (and admins) when a form submission comes in
CREATE OR REPLACE FUNCTION public.notify_on_form_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_form RECORD;
  v_submitter_email TEXT;
  v_admin_id UUID;
BEGIN
  SELECT id, title, created_by INTO v_form
  FROM public.custom_forms
  WHERE id = NEW.form_id;

  IF v_form.id IS NULL THEN
    RETURN NEW;
  END IF;

  v_submitter_email := COALESCE(
    NULLIF(NEW.responses->>'email',''),
    NULLIF(NEW.responses->>'Email',''),
    'אנונימי'
  );

  -- Notify form owner
  IF v_form.created_by IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      v_form.created_by,
      'form_submission',
      'טופס חדש התקבל: ' || v_form.title,
      'הגשה חדשה מ־' || v_submitter_email,
      '/admin-hub?tab=studio&sub=forms',
      jsonb_build_object('form_id', v_form.id, 'submission_id', NEW.id)
    );
  END IF;

  -- Also notify all admins (so any admin sees the submission)
  FOR v_admin_id IN
    SELECT ur.user_id FROM public.user_roles ur
    WHERE ur.role = 'admin'
      AND (v_form.created_by IS NULL OR ur.user_id <> v_form.created_by)
  LOOP
    INSERT INTO public.user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      v_admin_id,
      'form_submission',
      'טופס חדש התקבל: ' || v_form.title,
      'הגשה חדשה מ־' || v_submitter_email,
      '/admin-hub?tab=studio&sub=forms',
      jsonb_build_object('form_id', v_form.id, 'submission_id', NEW.id)
    );
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_form_submission ON public.form_submissions;
CREATE TRIGGER trg_notify_on_form_submission
AFTER INSERT ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_form_submission();

-- 2) Fix security finding: skills table permissive policy exposes all user rows
DROP POLICY IF EXISTS "Skills catalog readable by all" ON public.skills;

-- Ensure a safe catalog-only anonymous read policy exists (only rows without user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'skills'
      AND policyname = 'Skills catalog anon readable'
  ) THEN
    EXECUTE 'CREATE POLICY "Skills catalog anon readable" ON public.skills FOR SELECT TO anon USING (user_id IS NULL)';
  END IF;
END $$;
