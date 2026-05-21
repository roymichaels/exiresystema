
CREATE TABLE IF NOT EXISTS public.landing_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  source text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  language text,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS landing_chat_messages_session_idx
  ON public.landing_chat_messages (session_id, created_at);
CREATE INDEX IF NOT EXISTS landing_chat_messages_created_idx
  ON public.landing_chat_messages (created_at DESC);

ALTER TABLE public.landing_chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) may append a message — this is a visitor log.
CREATE POLICY "Anyone can log landing chat messages"
  ON public.landing_chat_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins may read.
CREATE POLICY "Admins can read landing chat messages"
  ON public.landing_chat_messages
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
