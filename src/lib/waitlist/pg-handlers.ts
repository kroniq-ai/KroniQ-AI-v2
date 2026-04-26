import { generateReferralCode, normalizeReferralCode } from "@/lib/waitlist/referral-code";
import { publicLeaderboardName } from "@/lib/waitlist/display-name";
import { getWaitlistSql } from "@/lib/waitlist/direct-pg";

const MAX_NAME = 200;
const MAX_OTHER = 200;
const MAX_PHONE = 40;

/** Marker in `other_role` for email-only hero signup; cleared when profile is completed. */
export const WAITLIST_QUICK_JOIN_MARKER = "__quick_join__";

function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string };
  return err?.code === "23505";
}

export async function postWaitlistPg(input: {
  name: string;
  emailRaw: string;
  phone: string;
  role: string;
  otherRole: string;
  referredByRaw: string | null;
  ipHash: string;
}): Promise<
  | { status: "duplicate"; referralCode: string }
  | { status: "ok"; referralCode: string; referrerEmail?: string }
  | { status: "error"; message: string }
> {
  const sql = getWaitlistSql();
  const name = input.name.slice(0, MAX_NAME);
  const emailRaw = input.emailRaw;
  const phone = input.phone.slice(0, MAX_PHONE) || null;
  const role = input.role;
  const otherRole = input.otherRole.slice(0, MAX_OTHER) || null;
  const referredBy = normalizeReferralCode(input.referredByRaw);

  const existing = await sql<{ referral_code: string }[]>`
    SELECT referral_code FROM public.waitlist_signups
    WHERE lower(email) = lower(${emailRaw})
    LIMIT 1
  `;
  if (existing.length > 0) {
    return { status: "duplicate", referralCode: existing[0].referral_code };
  }

  let referrerId: string | null = null;
  let referredByStored: string | null = null;
  let referrerEmailOut: string | undefined;

  if (referredBy) {
    const ref = await sql<{ id: string; email: string; disqualified: boolean }[]>`
      SELECT id, email, disqualified FROM public.waitlist_signups
      WHERE referral_code = ${referredBy}
      LIMIT 1
    `;
    const r = ref[0];
    if (r && r.email.toLowerCase() !== emailRaw && !r.disqualified) {
      referrerId = r.id;
      referredByStored = referredBy;
      referrerEmailOut = r.email.toLowerCase();
    }
  }

  let referralCode = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    referralCode = generateReferralCode(8);
    try {
      await sql`
        INSERT INTO public.waitlist_signups (
          email, name, phone, role, other_role, referral_code, referred_by_code, signup_ip_hash
        ) VALUES (
          ${emailRaw},
          ${name},
          ${phone},
          ${role},
          ${otherRole},
          ${referralCode},
          ${referredByStored},
          ${input.ipHash}
        )
      `;
      break;
    } catch (e) {
      if (isUniqueViolation(e)) {
        continue;
      }
      console.error("[waitlist pg] insert", e);
      return { status: "error", message: "Could not join waitlist" };
    }
  }

  if (!referralCode) {
    return { status: "error", message: "Could not join waitlist" };
  }

  if (referrerId) {
    try {
      await sql`
        UPDATE public.waitlist_signups
        SET referral_points = referral_points + 1
        WHERE id = ${referrerId}::uuid AND NOT disqualified
      `;
    } catch (e) {
      console.error("[waitlist pg] increment referrer", e);
    }
  }

  return { status: "ok", referralCode, referrerEmail: referrerEmailOut };
}

export async function updateWaitlistProfilePg(input: {
  emailRaw: string;
  name?: string;
  phone?: string;
  role?: string;
  otherRole?: string;
}): Promise<{ status: "ok" | "not_found" | "error"; message?: string }> {
  const sql = getWaitlistSql();
  const emailRaw = input.emailRaw.trim().toLowerCase();

  const existing = await sql<{ id: string }[]>`
    SELECT id FROM public.waitlist_signups WHERE lower(email) = lower(${emailRaw}) LIMIT 1
  `;
  if (existing.length === 0) {
    return { status: "not_found" };
  }

  const name = input.name?.trim();
  const role = input.role?.trim();
  const otherRole = input.otherRole?.trim();

  try {
    if (name && name.length > 0) {
      await sql`
        UPDATE public.waitlist_signups
        SET name = ${name.slice(0, MAX_NAME)}
        WHERE lower(email) = lower(${emailRaw})
      `;
    }
    if (input.phone !== undefined) {
      const phoneTrim = input.phone.trim();
      await sql`
        UPDATE public.waitlist_signups
        SET phone = ${phoneTrim ? phoneTrim.slice(0, MAX_PHONE) : null}
        WHERE lower(email) = lower(${emailRaw})
      `;
    }
    if (role && role.length > 0) {
      const other =
        role === "Other" ? (otherRole ? otherRole.slice(0, MAX_OTHER) : null) : null;
      await sql`
        UPDATE public.waitlist_signups
        SET role = ${role}, other_role = ${other}
        WHERE lower(email) = lower(${emailRaw})
      `;
    } else if (otherRole !== undefined && !role) {
      await sql`
        UPDATE public.waitlist_signups
        SET other_role = ${otherRole ? otherRole.slice(0, MAX_OTHER) : null}
        WHERE lower(email) = lower(${emailRaw})
      `;
    }
  } catch (e) {
    console.error("[waitlist pg] profile update", e);
    return { status: "error", message: "Could not update profile" };
  }

  return { status: "ok" };
}

export async function getWaitlistStatsPg(): Promise<{
  configured: true;
  dbCount: number;
  leaderboard: { rank: number; displayName: string; referralPoints: number }[];
}> {
  const sql = getWaitlistSql();
  const countRows = await sql<{ n: string }[]>`
    SELECT count(*)::text AS n FROM public.waitlist_signups
  `;
  const dbCount = parseInt(countRows[0]?.n ?? "0", 10) || 0;

  const lbEnabled = process.env.NEXT_PUBLIC_WAITLIST_LEADERBOARD !== "false";
  let leaderboard: { rank: number; displayName: string; referralPoints: number }[] = [];

  if (lbEnabled) {
    const rows = await sql<{ name: string; referral_points: number }[]>`
      SELECT name, referral_points FROM public.waitlist_signups
      WHERE NOT disqualified AND referral_points > 0
      ORDER BY referral_points DESC
      LIMIT 5
    `;
    leaderboard = rows.map((r, i) => ({
      rank: i + 1,
      displayName: publicLeaderboardName(r.name ?? ""),
      referralPoints: r.referral_points ?? 0,
    }));
  }

  return { configured: true, dbCount, leaderboard };
}

export type WaitlistInvitee = {
  email: string;
  displayName: string;
  joinedAt: string;
};

export type WaitlistMemberReferralStatsOk = {
  status: "ok";
  email: string;
  referralCode: string;
  referralPoints: number;
  displayName: string;
  rank: number | null;
  totalRanked: number;
  dbCount: number;
  disqualified: boolean;
  invitees: WaitlistInvitee[];
};

export async function getWaitlistMemberReferralStatsPg(input: {
  emailRaw?: string;
  referralCode?: string | null;
}): Promise<WaitlistMemberReferralStatsOk | { status: "not_found" } | { status: "error"; message: string }> {
  const sql = getWaitlistSql();
  const emailRaw = input.emailRaw?.trim().toLowerCase();
  const codeNorm = normalizeReferralCode(input.referralCode ?? null);

  if (!emailRaw && !codeNorm) {
    return { status: "error", message: "Missing identifier" };
  }

  try {
    const rows = emailRaw
      ? await sql<
          {
            email: string;
            referral_code: string;
            referral_points: number;
            name: string;
            disqualified: boolean;
            rank: number | null;
            db_count: string;
            total_ranked: string;
          }[]
        >`
        WITH ranked AS (
          SELECT
            id,
            RANK() OVER (ORDER BY referral_points DESC) AS rnk
          FROM public.waitlist_signups
          WHERE NOT disqualified
        )
        SELECT
          w.email,
          w.referral_code,
          w.referral_points,
          w.name,
          w.disqualified,
          r.rnk::int AS rank,
          (SELECT count(*)::text FROM public.waitlist_signups) AS db_count,
          (SELECT count(*)::text FROM public.waitlist_signups WHERE NOT disqualified) AS total_ranked
        FROM public.waitlist_signups w
        LEFT JOIN ranked r ON r.id = w.id
        WHERE lower(w.email) = lower(${emailRaw})
        LIMIT 1
      `
      : await sql<
          {
            email: string;
            referral_code: string;
            referral_points: number;
            name: string;
            disqualified: boolean;
            rank: number | null;
            db_count: string;
            total_ranked: string;
          }[]
        >`
        WITH ranked AS (
          SELECT
            id,
            RANK() OVER (ORDER BY referral_points DESC) AS rnk
          FROM public.waitlist_signups
          WHERE NOT disqualified
        )
        SELECT
          w.email,
          w.referral_code,
          w.referral_points,
          w.name,
          w.disqualified,
          r.rnk::int AS rank,
          (SELECT count(*)::text FROM public.waitlist_signups) AS db_count,
          (SELECT count(*)::text FROM public.waitlist_signups WHERE NOT disqualified) AS total_ranked
        FROM public.waitlist_signups w
        LEFT JOIN ranked r ON r.id = w.id
        WHERE w.referral_code = ${codeNorm}
        LIMIT 1
      `;

    const row = rows[0];
    if (!row) {
      return { status: "not_found" };
    }

    const dbCount = parseInt(row.db_count ?? "0", 10) || 0;
    const totalRanked = parseInt(row.total_ranked ?? "0", 10) || 0;

    let invitees: WaitlistInvitee[] = [];
    try {
      const invRows = await sql<{ email: string; name: string; created_at: Date }[]>`
        SELECT email, name, created_at
        FROM public.waitlist_signups
        WHERE referred_by_code = ${row.referral_code}
        ORDER BY created_at DESC
        LIMIT 100
      `;
      invitees = invRows.map((inv) => ({
        email: inv.email,
        displayName: publicLeaderboardName(inv.name ?? ""),
        joinedAt:
          inv.created_at instanceof Date
            ? inv.created_at.toISOString()
            : new Date(inv.created_at as unknown as string).toISOString(),
      }));
    } catch (invErr) {
      console.error("[waitlist pg] member invitees", invErr);
    }

    return {
      status: "ok",
      email: row.email,
      referralCode: row.referral_code,
      referralPoints: row.referral_points ?? 0,
      displayName: publicLeaderboardName(row.name ?? ""),
      rank: row.disqualified ? null : row.rank,
      totalRanked,
      dbCount,
      disqualified: row.disqualified,
      invitees,
    };
  } catch (e) {
    console.error("[waitlist pg] member referral stats", e);
    return { status: "error", message: "Could not load referral stats" };
  }
}

export async function completeOauthWaitlistPg(input: {
  userId: string;
  emailRaw: string;
  name: string;
  avatarUrl: string | null;
  referredByRaw: string | null;
  ipHash: string;
}): Promise<
  | { status: "ok"; email: string; name: string; avatarUrl: string | null; referralCode: string; alreadyMember: boolean }
  | { status: "error"; message: string }
> {
  const sql = getWaitlistSql();
  const emailRaw = input.emailRaw;
  const name = input.name.slice(0, MAX_NAME);
  const referredBy = normalizeReferralCode(input.referredByRaw);

  const existing = await sql<{ id: string; referral_code: string; name: string }[]>`
    SELECT id, referral_code, name FROM public.waitlist_signups
    WHERE lower(email) = lower(${emailRaw})
    LIMIT 1
  `;

  if (existing.length > 0) {
    const row = existing[0];
    const displayName = name || row.name;
    try {
      await sql`
        UPDATE public.waitlist_signups
        SET
          auth_user_id = ${input.userId}::uuid,
          avatar_url = ${input.avatarUrl},
          name = ${displayName}
        WHERE id = ${row.id}::uuid
      `;
    } catch (e) {
      const msg = String(e);
      if (msg.includes("auth_user_id") || msg.includes("avatar_url") || msg.includes("column")) {
        await sql`
          UPDATE public.waitlist_signups
          SET name = ${displayName}
          WHERE id = ${row.id}::uuid
        `;
      } else {
        console.error("[waitlist pg] oauth update existing", e);
        return { status: "error", message: "Could not update profile" };
      }
    }

    return {
      status: "ok",
      email: emailRaw,
      name: displayName,
      avatarUrl: input.avatarUrl,
      referralCode: row.referral_code,
      alreadyMember: true,
    };
  }

  let referrerId: string | null = null;
  let referredByStored: string | null = null;

  if (referredBy) {
    const ref = await sql<{ id: string; email: string; disqualified: boolean }[]>`
      SELECT id, email, disqualified FROM public.waitlist_signups
      WHERE referral_code = ${referredBy}
      LIMIT 1
    `;
    const r = ref[0];
    if (r && r.email.toLowerCase() !== emailRaw && !r.disqualified) {
      referrerId = r.id;
      referredByStored = referredBy;
    }
  }

  let referralCode = "";

  const tryInsertWithOAuthCols = async (code: string) => {
    await sql`
      INSERT INTO public.waitlist_signups (
        email, name, phone, role, other_role, referral_code, referred_by_code, signup_ip_hash,
        auth_user_id, avatar_url
      ) VALUES (
        ${emailRaw},
        ${name},
        ${null},
        ${"Founder"},
        ${null},
        ${code},
        ${referredByStored},
        ${input.ipHash},
        ${input.userId}::uuid,
        ${input.avatarUrl}
      )
    `;
  };

  const tryInsertBaseOnly = async (code: string) => {
    await sql`
      INSERT INTO public.waitlist_signups (
        email, name, phone, role, other_role, referral_code, referred_by_code, signup_ip_hash
      ) VALUES (
        ${emailRaw},
        ${name},
        ${null},
        ${"Founder"},
        ${null},
        ${code},
        ${referredByStored},
        ${input.ipHash}
      )
    `;
  };

  for (let attempt = 0; attempt < 8; attempt++) {
    referralCode = generateReferralCode(8);
    try {
      try {
        await tryInsertWithOAuthCols(referralCode);
      } catch (e) {
        const msg = String(e);
        if (msg.includes("auth_user_id") || msg.includes("avatar_url") || msg.includes("column")) {
          await tryInsertBaseOnly(referralCode);
        } else if (isUniqueViolation(e)) {
          continue;
        } else {
          throw e;
        }
      }
      break;
    } catch (e) {
      if (isUniqueViolation(e)) {
        continue;
      }
      console.error("[waitlist pg] oauth insert", e);
      return { status: "error", message: "Could not join waitlist" };
    }
  }

  if (!referralCode) {
    return { status: "error", message: "Could not join waitlist" };
  }

  if (referrerId) {
    try {
      await sql`
        UPDATE public.waitlist_signups
        SET referral_points = referral_points + 1
        WHERE id = ${referrerId}::uuid AND NOT disqualified
      `;
    } catch (e) {
      console.error("[waitlist pg] oauth increment", e);
    }
  }

  return {
    status: "ok",
    email: emailRaw,
    name,
    avatarUrl: input.avatarUrl,
    referralCode,
    alreadyMember: false,
  };
}
