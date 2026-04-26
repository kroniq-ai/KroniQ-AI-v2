import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getWaitlistDbUrlConfigIssue,
  getWaitlistSql,
  isWaitlistDirectPg,
} from "@/lib/waitlist/direct-pg";
import { waitlistPgFailureHint } from "@/lib/waitlist/pg-connect-errors";

/**
 * Local diagnostics: which waitlist backends are configured / whether REST can see the table.
 * No secrets in the response.
 */
export async function GET() {
  const directPostgres = isWaitlistDirectPg();
  const poolerConfigIssue = getWaitlistDbUrlConfigIssue();
  const supabaseRest =
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());

  let directPgProbeOk: boolean | null = null;
  let directPgErrorCode: string | null = null;
  let directPgHint: string | null = null;
  if (directPostgres && !poolerConfigIssue) {
    try {
      const sql = getWaitlistSql();
      await sql`SELECT 1 AS ok`;
      directPgProbeOk = true;
    } catch (e) {
      directPgProbeOk = false;
      const err = e as { code?: string; message?: string };
      directPgErrorCode =
        err.code ??
        (typeof err.message === "string" ? err.message.slice(0, 160) : "unknown");
      directPgHint = waitlistPgFailureHint(e) ?? null;
    }
  }

  let restProbeOk: boolean | null = null;
  let restErrorCode: string | null = null;

  if (supabaseRest) {
    try {
      const supabase = await createServiceRoleClient();
      const { error } = await supabase
        .from("waitlist_signups")
        .select("id")
        .limit(1);
      if (error) {
        restErrorCode = error.code ?? "unknown";
        restProbeOk = false;
      } else {
        restProbeOk = true;
      }
    } catch {
      restErrorCode = "exception";
      restProbeOk = false;
    }
  }

  const pgrst205 = restErrorCode === "PGRST205";

  let hint: string;
  if (poolerConfigIssue) {
    hint = poolerConfigIssue;
  } else if (directPostgres && directPgProbeOk === false && (directPgHint || directPgErrorCode)) {
    hint =
      directPgHint ??
      `Direct Postgres probe failed (${directPgErrorCode}). Common fixes: wrong database password in DATABASE_URL (reset in Supabase → Database settings), or paste the full URI from Connect.`;
  } else if (directPostgres && pgrst205) {
    hint =
      "Pooler URL is set — waitlist APIs use direct Postgres. PostgREST may still show PGRST205; that is OK here. Optional: NOTIFY pgrst, 'reload schema'; in SQL Editor to fix REST/Table Editor.";
  } else if (directPostgres) {
    hint = "Pooler URL is set; direct Postgres probe succeeded; waitlist can use the DB.";
  } else if (pgrst205) {
    hint =
      "No working direct Postgres URL: add DATABASE_URL to .env.local, or run 002 + NOTIFY pgrst, 'reload schema'; in SQL Editor.";
  } else if (restProbeOk) {
    hint = "PostgREST can read waitlist_signups.";
  } else {
    hint = "Check SUPABASE_SERVICE_ROLE_KEY and that waitlist_signups exists.";
  }

  return NextResponse.json({
    directPostgres,
    poolerConfigIssue,
    directPgProbeOk,
    directPgErrorCode,
    directPgHint,
    supabaseRest,
    restProbeOk,
    restErrorCode,
    hint,
  });
}
