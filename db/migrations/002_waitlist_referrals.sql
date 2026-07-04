-- Waitlist signups with referral codes (pre-launch leaderboard)
-- Run in Supabase SQL Editor after 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_signups_email_lower
  ON public.waitlist_signups (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_signups_referral_code
  ON public.waitlist_signups (referral_code);

CREATE INDEX IF NOT EXISTS idx_waitlist_signups_leaderboard
  ON public.waitlist_signups (referral_points DESC)
  WHERE NOT disqualified AND referral_points > 0;

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- No GRANT to anon/authenticated — service role bypasses RLS for API routes.

COMMENT ON TABLE public.waitlist_signups IS 'Waitlist; accessed only via Next.js API with service role.';

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

-- If the app still says the table is missing (PGRST205), PostgREST’s schema cache is stale.
-- Run db/scripts/verify_waitlist_and_reload_postgrest.sql in the SQL Editor (NOTIFY reload).
