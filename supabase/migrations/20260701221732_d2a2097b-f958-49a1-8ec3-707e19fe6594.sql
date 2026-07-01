
DROP FUNCTION IF EXISTS public.get_practitioner_by_domain(text);

-- 1. coupons_public_read_active
DROP POLICY IF EXISTS "Users can read active coupons" ON public.coupons;

-- 2. custom_forms_access_token_public_exposure
DROP POLICY IF EXISTS "Anyone can view published forms by token" ON public.custom_forms;

CREATE OR REPLACE FUNCTION public.get_public_form_by_token(p_token text)
RETURNS TABLE (id uuid, title text, description text, settings jsonb)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT id, title, description, settings
  FROM public.custom_forms
  WHERE access_token = p_token AND status = 'published'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_form_by_token(text) TO anon, authenticated;

-- 3. practitioner_settings_public_read
DROP POLICY IF EXISTS "Anyone can read settings for domain lookup" ON public.practitioner_settings;

CREATE FUNCTION public.get_practitioner_by_domain(p_domain text)
RETURNS TABLE (
  practitioner_id uuid, subdomain text, custom_domain text, domain_verified boolean,
  logo_url text, favicon_url text, brand_color text, brand_color_secondary text,
  hero_heading_he text, hero_heading_en text, hero_subheading_he text, hero_subheading_en text,
  hero_image_url text, meta_title text, meta_description text, og_image_url text,
  default_language text, timezone text,
  enable_courses boolean, enable_services boolean, enable_products boolean, enable_community boolean
)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT
    practitioner_id, subdomain, custom_domain, domain_verified,
    logo_url, favicon_url, brand_color, brand_color_secondary,
    hero_heading_he, hero_heading_en, hero_subheading_he, hero_subheading_en,
    hero_image_url, meta_title, meta_description, og_image_url,
    default_language, timezone,
    enable_courses, enable_services, enable_products, enable_community
  FROM public.practitioner_settings
  WHERE custom_domain = p_domain OR subdomain = p_domain
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_practitioner_by_domain(text) TO anon, authenticated;

-- 4. page_views_update_unscoped
DROP POLICY IF EXISTS "Anyone can update page views" ON public.page_views;
CREATE POLICY "Admins can update page views" ON public.page_views FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. visitor_sessions_update_unscoped
DROP POLICY IF EXISTS "Anyone can update their own session" ON public.visitor_sessions;
CREATE POLICY "Admins can update visitor sessions" ON public.visitor_sessions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. SUPA_rls_policy_always_true
DROP POLICY IF EXISTS "Service role can update recalibration logs" ON public.recalibration_logs;

-- 7. SUPA_function_search_path_mutable
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, pgmq
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, pgmq
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

-- 8+9. lock down internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;

DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.prosecdef=true
      AND p.proname IN (
        'create_admin_notification','fanout_admin_notifications_to_users',
        'check_expiring_access','check_milestone_from_minis','check_mission_completion',
        'check_xp_integrity','bridge_proactive_to_notification','archive_aion_decision',
        'assign_user_job','fm_distribute_revenue','fm_generate_snapshot','fm_post_transaction',
        'fm_auto_create_wallet','auto_create_aurora_onboarding_progress',
        'auto_create_practitioner_settings','auto_link_practice_on_completion',
        'create_affiliate_referral_on_payment'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated', fn.proname, fn.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO service_role', fn.proname, fn.args);
  END LOOP;
END $$;
