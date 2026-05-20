
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS conversation JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pain_category TEXT,
  ADD COLUMN IF NOT EXISTS pain_duration TEXT,
  ADD COLUMN IF NOT EXISTS prior_attempts TEXT[],
  ADD COLUMN IF NOT EXISTS desired_outcome TEXT,
  ADD COLUMN IF NOT EXISTS transformation_vision TEXT,
  ADD COLUMN IF NOT EXISTS readiness_score INT,
  ADD COLUMN IF NOT EXISTS intent TEXT,
  ADD COLUMN IF NOT EXISTS ai_analysis JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Make sure 'source' has a default so anonymous intake inserts succeed
ALTER TABLE public.leads ALTER COLUMN source SET DEFAULT 'intake_chat';

-- Ensure RLS is on (it should already be)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous + authenticated visitors to submit a lead via the edge function.
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
