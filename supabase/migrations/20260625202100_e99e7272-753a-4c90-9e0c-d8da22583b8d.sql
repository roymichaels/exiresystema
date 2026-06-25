
-- 1. clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id uuid,
  full_name text NOT NULL,
  email text,
  phone text,
  whatsapp text,
  instagram_handle text,
  manychat_id text,
  language text DEFAULT 'he',
  birthday date,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  risk_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  consent jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clients_practitioner_idx ON public.clients(practitioner_id);
CREATE INDEX clients_lead_idx ON public.clients(lead_id);
CREATE INDEX clients_user_idx ON public.clients(user_id);
CREATE UNIQUE INDEX clients_practitioner_lead_uq ON public.clients(practitioner_id, lead_id) WHERE lead_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Practitioners manage own clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (practitioner_id = auth.uid())
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Linked client can read own record"
  ON public.clients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. client_profiles
CREATE TABLE public.client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  presenting_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  subconscious_summary text,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX client_profiles_client_idx ON public.client_profiles(client_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_profiles TO authenticated;
GRANT ALL ON public.client_profiles TO service_role;

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all client profiles"
  ON public.client_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Practitioners manage profiles of own clients"
  ON public.client_profiles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_profiles.client_id AND c.practitioner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_profiles.client_id AND c.practitioner_id = auth.uid()));

CREATE POLICY "Linked client can read own profile"
  ON public.client_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_profiles.client_id AND c.user_id = auth.uid()));

-- 3. updated_at triggers (reuse existing helper if present, else create)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
