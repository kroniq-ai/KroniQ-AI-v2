/** PostgREST: relation not in schema cache (table missing or not yet visible to API). */
export function isWaitlistTableMissing(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  if (err.code === "PGRST205") return true;
  const m = err.message ?? "";
  return /could not find the table ['"]public\.waitlist_signups['"]/i.test(m);
}

export const WAITLIST_SETUP_MESSAGE =
  "Database setup needed: (0) In .env.local you must have an uncommented line DATABASE_URL=… (no # at the start). Copy the Transaction pooler URI from Supabase Dashboard → Connect (database password, not API keys). (1) Run db/migrations/002_waitlist_referrals.sql in the SQL Editor if the table does not exist. (2) In SQL Editor you can run NOTIFY pgrst, 'reload schema'; to refresh PostgREST. (3) Run 003_waitlist_oauth.sql if your deployment still references legacy OAuth columns.";
