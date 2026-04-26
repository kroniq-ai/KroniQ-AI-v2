-- Optional: link waitlist rows to Supabase Auth (Google waitlist signup)
-- Run in Supabase SQL Editor after 002_waitlist_referrals.sql

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_waitlist_signups_auth_user
  ON public.waitlist_signups(auth_user_id)
  WHERE auth_user_id IS NOT NULL;
