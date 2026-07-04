/** Maps common Supabase pooler / Postgres errors to actionable hints (no secrets). */
export function waitlistPgFailureHint(e: unknown): string | undefined {
  const err = e as { code?: string; message?: string };
  const msg = (err.message ?? "").toLowerCase();
  const code = err.code ?? "";

  if (code === "XX000" || msg.includes("tenant or user not found")) {
    return "Pooler rejected the connection (wrong host or region). In Supabase → Connect → Transaction pooler, copy the exact pooler hostname into SUPABASE_POOLER_HOST in .env.local (e.g. aws-1-us-east-2.pooler.supabase.com — yours may differ from aws-0-us-east-1). Username must stay postgres.<project-ref>.";
  }
  if (code === "28P01" || msg.includes("password authentication failed")) {
    return "Wrong database password. Reset it in Supabase → Database → Settings and update DATABASE_URL (not the API JWT).";
  }
  if (code === "ENOTFOUND" || msg.includes("getaddrinfo")) {
    return "Could not resolve the database host. Check DATABASE_URL / SUPABASE_POOLER_HOST for typos.";
  }
  return undefined;
}
