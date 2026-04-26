import postgres from "postgres";

/**
 * Direct Postgres access bypasses PostgREST (fixes stubborn PGRST205 / schema cache on some Supabase projects).
 *
 * **IPv4 / Windows:** `db.<ref>.supabase.co` is often **IPv6-only**. Node may report `ENOTFOUND` if IPv6 is unavailable.
 * Set **`SUPABASE_POOLER_HOST`** to the **exact** transaction pooler hostname from Connect (e.g. `aws-1-us-east-2.pooler.supabase.com`)
 * if you see **XX000 / Tenant or user not found** (wrong `aws-0-*` guess). Optional: **`SUPABASE_POOLER_REGION`** + default `aws-0-<region>...`.
 * User in the pooler URI must be **`postgres.<project-ref>`**. Port defaults to **6543** (`SUPABASE_POOLER_PORT` overrides).
 *
 * Env candidates: `WAITLIST_DATABASE_URL`, `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `SUPABASE_DB_URL`.
 */
function rawWaitlistDbUrlFromEnv(): string | null {
  const candidates = [
    process.env.WAITLIST_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.SUPABASE_DB_URL,
  ];
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return null;
}

function getSupabaseProjectRef(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!base) return null;
  try {
    const host = new URL(base).hostname;
    const m = /^([a-z0-9]+)\.supabase\.co$/i.exec(host);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

function poolerRegionFromEnv(): string | null {
  const r = process.env.SUPABASE_POOLER_REGION?.trim();
  return r || null;
}

/** IPv4 pooler segment; `db.*.supabase.co` is often IPv6-only (ENOTFOUND on Windows). */
const DEFAULT_POOLER_REGION = "us-east-1";

function transactionPoolerRegion(): string {
  return poolerRegionFromEnv() ?? DEFAULT_POOLER_REGION;
}

/** Full pooler hostname/port; `SUPABASE_POOLER_HOST` wins over constructed `aws-0-<region>`. */
function getTransactionPoolerEndpoint(): { hostname: string; port: string } {
  const raw = process.env.SUPABASE_POOLER_HOST?.trim();
  const fallbackPort = process.env.SUPABASE_POOLER_PORT?.trim() || "6543";

  if (raw) {
    try {
      if (raw.includes("://")) {
        const parsed = new URL(raw);
        return { hostname: parsed.hostname, port: parsed.port || fallbackPort };
      }
      const noPath = raw.split("/")[0];
      const colon = noPath.lastIndexOf(":");
      if (colon > 0 && /^\d+$/.test(noPath.slice(colon + 1))) {
        return { hostname: noPath.slice(0, colon), port: noPath.slice(colon + 1) };
      }
      return { hostname: noPath, port: fallbackPort };
    } catch {
      /* fall through */
    }
  }

  const region = transactionPoolerRegion();
  return { hostname: `aws-0-${region}.pooler.supabase.com`, port: fallbackPort };
}

function encodePassword(rawUrl: URL): string {
  let pwd = rawUrl.password;
  try {
    pwd = decodeURIComponent(rawUrl.password);
  } catch {
    pwd = rawUrl.password;
  }
  return encodeURIComponent(pwd);
}

/** Ref from `db.<ref>.supabase.co` — works even when `NEXT_PUBLIC_SUPABASE_URL` is missing in this process. */
function refFromDbHostname(host: string): string | null {
  const m = /^db\.([a-z0-9]+)\.supabase\.co$/i.exec(host);
  return m?.[1]?.toLowerCase() ?? null;
}

/** Ref from pooler-style user `postgres.<ref>` in the connection URI. */
function refFromPostgresUsername(username: string): string | null {
  let u = username;
  try {
    u = decodeURIComponent(username);
  } catch {
    /* keep */
  }
  const m = /^postgres\.([a-z0-9]+)$/i.exec(u);
  return m?.[1]?.toLowerCase() ?? null;
}

/**
 * Rewrites template hosts and IPv6-only `db.*` URLs to the IPv4 transaction pooler when region is known.
 */
export function normalizeSupabasePoolerUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return raw;
  }
  const host = u.hostname.toLowerCase();
  const encPwd = encodePassword(u);
  const ep = getTransactionPoolerEndpoint();

  const dbRef = refFromDbHostname(host);
  if (dbRef) {
    const port = u.port || ep.port;
    return `postgresql://postgres.${dbRef}:${encPwd}@${ep.hostname}:${port}/postgres`;
  }

  const brokenTemplate =
    /aws-0-REGION\./i.test(host) ||
    /^aws-0-REGION$/i.test(host) ||
    (/REGION/i.test(host) && host.endsWith("pooler.supabase.com"));

  const ref = getSupabaseProjectRef() ?? refFromPostgresUsername(u.username);
  if (brokenTemplate && ref) {
    return `postgresql://postgres.${ref}:${encPwd}@${ep.hostname}:${ep.port}/postgres`;
  }

  return raw;
}

export function getWaitlistDbUrl(): string | null {
  const raw = rawWaitlistDbUrlFromEnv();
  if (!raw) return null;
  return normalizeSupabasePoolerUrl(raw);
}

/** True when DATABASE_URL / WAITLIST_DATABASE_URL is set (not a React hook). */
export function isWaitlistDirectPg(): boolean {
  return Boolean(getWaitlistDbUrl());
}

/**
 * Detects remaining issues on the **effective** URL after normalization (no secrets returned).
 */
export function getWaitlistDbUrlConfigIssue(): string | null {
  const raw = rawWaitlistDbUrlFromEnv();
  if (!raw) return null;
  if (/\s/.test(raw)) {
    return "DATABASE_URL contains whitespace. Remove any spaces (e.g. before @) so the URI is one continuous line.";
  }
  const effective = normalizeSupabasePoolerUrl(raw);
  let u: URL;
  try {
    u = new URL(effective);
  } catch {
    return "DATABASE_URL is not a valid connection URL. Use the exact Transaction pooler string from Supabase Connect.";
  }
  const host = u.hostname;

  if (/aws-0-REGION\./i.test(host) || /^aws-0-REGION$/i.test(host)) {
    return "DATABASE_URL still uses the aws-0-REGION template and NEXT_PUBLIC_SUPABASE_URL is missing or invalid — cannot rewrite to the IPv4 pooler.";
  }
  if (/REGION/i.test(host) && host.includes("pooler.supabase")) {
    return "Pooler hostname still contains REGION. Paste the full URI from Supabase Connect or fix NEXT_PUBLIC_SUPABASE_URL.";
  }
  let pwd = u.password;
  try {
    pwd = decodeURIComponent(u.password);
  } catch {
    pwd = u.password;
  }
  const userDecoded = (() => {
    try {
      return decodeURIComponent(u.username);
    } catch {
      return u.username;
    }
  })();
  if (
    /\[YOUR_|PLACEHOLDER/i.test(userDecoded) ||
    /\[YOUR_|PLACEHOLDER/i.test(pwd) ||
    (pwd.startsWith("[") && pwd.endsWith("]"))
  ) {
    return "Remove square brackets and template text from the password (and user if present). Use the database password only; URL-encode special characters (e.g. ! → %21, @ → %40).";
  }
  return null;
}

/** Bump when pooler URL semantics change so dev HMR does not keep an old `postgres` client. */
const POOLER_CLIENT_EPOCH = "db-host-ref-v1";

const globalForSql = globalThis as unknown as {
  __waitlistPg?: postgres.Sql;
  __waitlistPgCacheKey?: string;
};

function hostNeedsSupabaseSsl(hostname: string): boolean {
  return hostname.endsWith(".supabase.co") || hostname.endsWith("pooler.supabase.com");
}

export function getWaitlistSql(): postgres.Sql {
  const url = getWaitlistDbUrl();
  if (!url) {
    throw new Error(
      "getWaitlistSql called without a pooler URL (WAITLIST_DATABASE_URL, DATABASE_URL, POSTGRES_URL, …)"
    );
  }
  const cacheKey = `${POOLER_CLIENT_EPOCH}\0${url}`;
  if (globalForSql.__waitlistPgCacheKey !== cacheKey) {
    if (globalForSql.__waitlistPg) {
      void globalForSql.__waitlistPg.end({ timeout: 1 }).catch(() => {});
    }
    globalForSql.__waitlistPgCacheKey = cacheKey;
    let supabaseHost = false;
    try {
      supabaseHost = hostNeedsSupabaseSsl(new URL(url).hostname);
    } catch {
      /* ignore */
    }
    globalForSql.__waitlistPg = postgres(url, {
      max: 1,
      connect_timeout: 5,
      ...(supabaseHost ? { ssl: "require" as const } : {}),
      prepare: false,
    });
  }
  const client = globalForSql.__waitlistPg;
  if (!client) {
    throw new Error("waitlist Postgres client failed to initialize");
  }
  return client;
}
