-- =============================================================================
-- Optional RLS policies for public.waitlist_signups (run after reset script)
-- =============================================================================
-- Your reset script enables RLS but adds NO policies. That means:
--   • anon / PostgREST: no row access (intended — API uses service role or direct PG)
--   • Supabase Table Editor: may show no rows when it impersonates a role that
--     respects RLS (depends on dashboard version). SQL Editor uses postgres and
--     bypasses RLS — use: SELECT * FROM public.waitlist_signups;
--
-- Safe policy: signed-in Supabase users can read ONLY their own row (matches auth_user_id).
-- Does NOT expose the full table via anon key.
-- =============================================================================

DROP POLICY IF EXISTS "waitlist_authenticated_read_own" ON public.waitlist_signups;

CREATE POLICY "waitlist_authenticated_read_own"
  ON public.waitlist_signups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Optional: allow users to update only their own row later (not used by MVP API).
-- DROP POLICY IF EXISTS "waitlist_authenticated_update_own" ON public.waitlist_signups;
-- CREATE POLICY "waitlist_authenticated_update_own"
--   ON public.waitlist_signups FOR UPDATE TO authenticated
--   USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);
