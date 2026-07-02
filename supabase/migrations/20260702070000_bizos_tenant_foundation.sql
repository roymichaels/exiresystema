-- ============================================================
-- BizOS Phase 2 — Tenant schema foundation
--
-- Goal: add tenant_id scoping to business-owned tables without
-- breaking existing Exire behavior. practitioner_id is preserved as
-- the user/owner identifier; tenant_id marks the workspace.
-- ============================================================

-- ============================================================
-- 1. tenants table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text NOT NULL,
  locale text NOT NULL DEFAULT 'he',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins manage tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- Tenant seeds (idempotent)
INSERT INTO public.tenants (id, slug, name, brand, locale, features)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'exire-systema', 'Exire Systema', 'Exire Systema', 'he', '["dashboard","leads","clients","studio","advisor","analytics","settings","integrations","users"]'),
  ('00000000-0000-0000-0000-000000000002', 'physiotherapy', 'Physio Therapy', 'Physio Therapy', 'he', '["patients","appointments","billing"]')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  locale = EXCLUDED.locale,
  features = EXCLUDED.features;

-- ============================================================
-- 2. tenant_memberships table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_memberships TO authenticated;
GRANT ALL ON public.tenant_memberships TO service_role;

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users read own memberships"
  ON public.tenant_memberships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Admins manage memberships"
  ON public.tenant_memberships FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user ON public.tenant_memberships(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON public.tenant_memberships(tenant_id);

-- Seed the admin user into both tenants (idempotent).
-- The admin user id is taken from the existing grant_dean_admin migration.
INSERT INTO public.tenant_memberships (user_id, tenant_id, role)
VALUES
  ('45c37cba-d445-4607-b225-54e4b2edabec', '00000000-0000-0000-0000-000000000001', 'admin'),
  ('45c37cba-d445-4607-b225-54e4b2edabec', '00000000-0000-0000-0000-000000000002', 'admin')
ON CONFLICT (user_id, tenant_id) DO UPDATE SET role = EXCLUDED.role;

-- ============================================================
-- 3. RLS helper function
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(target_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid() AND tenant_id = target_tenant_id
  );
$$;

-- ============================================================
-- 4. Add tenant_id to Priority 1 business tables and backfill
-- ============================================================

-- clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.clients SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.clients ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON public.clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_created ON public.clients(tenant_id, created_at DESC);

-- client_profiles
ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.client_profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.client_profiles ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_profiles_tenant ON public.client_profiles(tenant_id);

-- leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.leads SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.leads ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON public.leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_created ON public.leads(tenant_id, created_at DESC);

-- xsystem_sessions
ALTER TABLE public.xsystem_sessions ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_sessions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_sessions ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_sessions_tenant ON public.xsystem_sessions(tenant_id);

-- xsystem_session_notes
ALTER TABLE public.xsystem_session_notes ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_session_notes SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_session_notes ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_notes_tenant ON public.xsystem_session_notes(tenant_id);

-- xsystem_checkins
ALTER TABLE public.xsystem_checkins ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_checkins SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_checkins ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_checkins_tenant ON public.xsystem_checkins(tenant_id);

-- xsystem_followups
ALTER TABLE public.xsystem_followups ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_followups SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_followups ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_followups_tenant ON public.xsystem_followups(tenant_id);

-- xsystem_payments
ALTER TABLE public.xsystem_payments ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_payments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_payments ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_payments_tenant ON public.xsystem_payments(tenant_id);

-- xsystem_beliefs
ALTER TABLE public.xsystem_beliefs ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_beliefs SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_beliefs ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_beliefs_tenant ON public.xsystem_beliefs(tenant_id);

-- xsystem_patterns
ALTER TABLE public.xsystem_patterns ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_patterns SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_patterns ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_patterns_tenant ON public.xsystem_patterns(tenant_id);

-- xsystem_inner_parts
ALTER TABLE public.xsystem_inner_parts ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_inner_parts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_inner_parts ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_parts_tenant ON public.xsystem_inner_parts(tenant_id);

-- xsystem_rooms
ALTER TABLE public.xsystem_rooms ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_rooms SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_rooms ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_rooms_tenant ON public.xsystem_rooms(tenant_id);

-- xsystem_client_rooms
ALTER TABLE public.xsystem_client_rooms ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_client_rooms SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_client_rooms ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_client_rooms_tenant ON public.xsystem_client_rooms(tenant_id);

-- xsystem_protocols
ALTER TABLE public.xsystem_protocols ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_protocols SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_protocols ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_protocols_tenant ON public.xsystem_protocols(tenant_id);

-- xsystem_session_protocols
ALTER TABLE public.xsystem_session_protocols ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_session_protocols SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_session_protocols ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_session_protocols_tenant ON public.xsystem_session_protocols(tenant_id);

-- xsystem_audio_assignments
ALTER TABLE public.xsystem_audio_assignments ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_audio_assignments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_audio_assignments ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_audio_assignments_tenant ON public.xsystem_audio_assignments(tenant_id);

-- xsystem_message_templates
ALTER TABLE public.xsystem_message_templates ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_message_templates SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_message_templates ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_templates_tenant ON public.xsystem_message_templates(tenant_id);

-- xsystem_lead_form_mappings
ALTER TABLE public.xsystem_lead_form_mappings ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.xsystem_lead_form_mappings SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.xsystem_lead_form_mappings ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xsys_lead_form_mappings_tenant ON public.xsystem_lead_form_mappings(tenant_id);

-- ============================================================
-- 5. Add tenant_id to Priority 2 content/form tables
--    site_settings remains nullable to support global settings.
-- ============================================================

-- custom_forms
ALTER TABLE public.custom_forms ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.custom_forms SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.custom_forms ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_custom_forms_tenant ON public.custom_forms(tenant_id);

-- form_submissions
ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.form_submissions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.form_submissions ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant ON public.form_submissions(tenant_id);

-- blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.blog_posts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.blog_posts ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant ON public.blog_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_status ON public.blog_posts(tenant_id, status, published_at DESC);

-- faqs
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.faqs SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.faqs ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_faqs_tenant ON public.faqs(tenant_id);

-- testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.testimonials SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.testimonials ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_testimonials_tenant ON public.testimonials(tenant_id);

-- site_settings (nullable: keeps global settings support)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.site_settings SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_site_settings_tenant ON public.site_settings(tenant_id);

-- ============================================================
-- 6. Tenant access RLS policies for Priority 1 tables
--    Existing policies are left in place; these are additive.
-- ============================================================

CREATE POLICY IF NOT EXISTS "tenant_access_clients" ON public.clients
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_client_profiles" ON public.client_profiles
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_leads" ON public.leads
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_sessions" ON public.xsystem_sessions
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_session_notes" ON public.xsystem_session_notes
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_checkins" ON public.xsystem_checkins
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_followups" ON public.xsystem_followups
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_payments" ON public.xsystem_payments
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_beliefs" ON public.xsystem_beliefs
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_patterns" ON public.xsystem_patterns
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_inner_parts" ON public.xsystem_inner_parts
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_rooms" ON public.xsystem_rooms
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_client_rooms" ON public.xsystem_client_rooms
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_protocols" ON public.xsystem_protocols
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_session_protocols" ON public.xsystem_session_protocols
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_audio_assignments" ON public.xsystem_audio_assignments
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_message_templates" ON public.xsystem_message_templates
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY IF NOT EXISTS "tenant_access_xsystem_lead_form_mappings" ON public.xsystem_lead_form_mappings
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

-- ============================================================
-- 7. Note: Priority 2 RLS (content/forms) deferred to Phase 3.
--    These tables have public/admin policies that need careful
--    tenant-aware redesign without breaking existing sites.
-- ============================================================
