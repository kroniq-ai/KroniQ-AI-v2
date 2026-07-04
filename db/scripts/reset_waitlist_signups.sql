-- =============================================================================
-- RESET waitlist table + optional founder seed (run in Supabase SQL Editor)
-- =============================================================================
-- BEFORE THIS: fix pooler env or waitlist API will still fail:
--   Supabase → Project Settings → Database → Connection string → Transaction pooler
--   Set in .env.local:
--     SUPABASE_POOLER_HOST=<exact host from UI, e.g. aws-1-us-east-2.pooler.supabase.com>
--     WAITLIST_DATABASE_URL or DATABASE_URL = postgresql://postgres.<project-ref>:PASSWORD@HOST:6543/postgres
--   Username MUST be postgres.<project-ref> (not just postgres). Port 6543 for pooler.
-- =============================================================================

-- Drop dependent function first
DROP FUNCTION IF EXISTS public.increment_waitlist_referrer_points(UUID);

-- Table + policies
DROP TABLE IF EXISTS public.waitlist_signups CASCADE;

CREATE TABLE public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  other_role TEXT,
  referral_code TEXT NOT NULL,
  referred_by_code TEXT,
  referral_points INTEGER NOT NULL DEFAULT 0,
  disqualified BOOLEAN NOT NULL DEFAULT FALSE,
  signup_ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  avatar_url TEXT
);

CREATE UNIQUE INDEX idx_waitlist_signups_email_lower
  ON public.waitlist_signups (LOWER(email));

CREATE UNIQUE INDEX idx_waitlist_signups_referral_code
  ON public.waitlist_signups (referral_code);

CREATE INDEX idx_waitlist_signups_leaderboard
  ON public.waitlist_signups (referral_points DESC)
  WHERE NOT disqualified AND referral_points > 0;

CREATE INDEX idx_waitlist_signups_auth_user
  ON public.waitlist_signups(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.waitlist_signups IS 'Waitlist; accessed only via Next.js API with service role.';

-- RLS with zero policies blocks anon/authenticated via PostgREST. SQL Editor as
-- postgres bypasses RLS. If Table Editor shows empty rows, run SQL Editor:
--   SELECT * FROM public.waitlist_signups ORDER BY created_at DESC;
-- Optional policies: see waitlist_rls_policies.sql (read own row when auth_user_id set).

CREATE OR REPLACE FUNCTION public.increment_waitlist_referrer_points(p_referrer_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.waitlist_signups
  SET referral_points = referral_points + 1
  WHERE id = p_referrer_id AND NOT disqualified;
$$;

REVOKE ALL ON FUNCTION public.increment_waitlist_referrer_points(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_waitlist_referrer_points(UUID) TO service_role;

-- -----------------------------------------------------------------------------
-- Optional: reserved founder row (change referral_code if it collides)
-- -----------------------------------------------------------------------------
INSERT INTO public.waitlist_signups (
  email,
  name,
  phone,
  role,
  other_role,
  referral_code,
  referred_by_code,
  referral_points,
  disqualified,
  signup_ip_hash
)
SELECT
  'atirek.sd11@gmail.com',
  'Founder',
  NULL,
  'Other',
  NULL,
  'VOYDFND1',
  NULL,
  0,
  FALSE,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.waitlist_signups w WHERE lower(w.email) = lower('atirek.sd11@gmail.com')
);

-- If referral_code VOYDFND1 already existed from a previous partial run, use:
-- UPDATE public.waitlist_signups SET referral_code = 'VOYDFND1' WHERE lower(email) = lower('atirek.sd11@gmail.com');
