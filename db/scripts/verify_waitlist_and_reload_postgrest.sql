-- Run in Supabase → SQL Editor AFTER 002_waitlist_referrals.sql
-- Use this when the app still says the table is missing (PGRST205 / schema cache).

-- 1) Confirm the table exists in THIS database (should return one row)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'waitlist_signups';

-- 2) Optional: quick read check (should return 0 rows on a new table)
SELECT COUNT(*) AS row_count FROM public.waitlist_signups;

-- 3) Tell PostgREST to reload its schema cache (fixes most "table not in schema cache" errors)
NOTIFY pgrst, 'reload schema';
