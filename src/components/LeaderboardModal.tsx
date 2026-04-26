"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  buildWaitlistReferralShareUrl,
  getPublicSiteOriginServerSnapshot,
  getWaitlistMemberSession,
  setWaitlistMemberSession,
  subscribePublicSiteOrigin,
  type WaitlistMemberSession,
} from "@/lib/waitlist/client-session";
import Link from "next/link";
import { ChevronDown, Link2, Sparkles, Trophy, Users } from "lucide-react";
import { fetchWithTimeout, isTimeoutAbort } from "@/lib/waitlist/client-fetch";
import { normalizeReferralCode } from "@/lib/waitlist/referral-code-normalize";

type StatsPayload = {
  configured?: boolean;
  leaderboardEnabled?: boolean;
  leaderboard?: { rank: number; displayName: string; referralPoints: number }[];
  dbCount?: number;
  error?: string;
};

type InviteeRow = {
  email: string;
  displayName: string;
  joinedAt: string;
};

type MePayload = {
  status: "ok";
  referralCode: string;
  referralPoints: number;
  rank: number | null;
  totalRanked: number;
  dbCount: number;
  disqualified: boolean;
  authSource?: "session" | "referral_code";
  invitees: InviteeRow[];
};

type Props = {
  open: boolean;
  onClose: () => void;
};

function rankAccent(rank: number) {
  if (rank === 1) return "text-white";
  if (rank === 2) return "text-zinc-200/90";
  if (rank === 3) return "text-zinc-300/80";
  return "text-white/55";
}

function podiumBlockClass(rank: number) {
  if (rank === 1) {
    return "border-white/25 bg-gradient-to-b from-white/[0.12] via-zinc-900/30 to-black/40 shadow-[0_0_32px_-12px_rgba(255,255,255,0.08)]";
  }
  if (rank === 2) {
    return "border-white/18 bg-gradient-to-b from-zinc-300/12 via-zinc-900/25 to-black/35";
  }
  if (rank === 3) {
    return "border-white/16 bg-gradient-to-b from-zinc-500/10 via-zinc-900/20 to-black/35";
  }
  return "border-white/[0.08] bg-white/[0.03]";
}

function podiumHeightClass(rank: number) {
  if (rank === 1) return "min-h-[132px]";
  if (rank === 2) return "min-h-[108px]";
  if (rank === 3) return "min-h-[92px]";
  return "min-h-[80px]";
}

function formatJoined(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return "";
  }
}

export default function LeaderboardModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [member, setMember] = useState<WaitlistMemberSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [me, setMe] = useState<MePayload | null>(null);
  const [meError, setMeError] = useState<string | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const memberStatsReqId = useRef(0);
  const statsReqId = useRef(0);

  useEffect(() => {
    if (!open) return;
    const refreshMember = () => setMember(getWaitlistMemberSession());
    refreshMember();
    window.addEventListener("kroniq-waitlist-member-change", refreshMember);
    return () => window.removeEventListener("kroniq-waitlist-member-change", refreshMember);
  }, [open]);

  useEffect(() => {
    if (!open) {
      statsReqId.current += 1;
      setStatsLoading(false);
      return;
    }
    const myId = ++statsReqId.current;
    setStats(null);
    setLoadError(null);
    setStatsLoading(true);
    (async () => {
      try {
        const res = await fetchWithTimeout("/api/waitlist/stats", { cache: "no-store" });
        let data: StatsPayload;
        try {
          data = (await res.json()) as StatsPayload;
        } catch {
          if (myId !== statsReqId.current) return;
          setStats(null);
          setLoadError("Could not load leaderboard.");
          return;
        }
        if (myId !== statsReqId.current) return;
        if (!res.ok) {
          setStats(data);
          setLoadError(typeof data.error === "string" ? data.error : "Could not load leaderboard.");
          return;
        }
        setStats(data);
        setLoadError(null);
      } catch (e) {
        if (myId !== statsReqId.current) return;
        setStats(null);
        setLoadError(
          isTimeoutAbort(e) ? "Leaderboard timed out. Check your connection and try again." : "Could not load leaderboard."
        );
      } finally {
        if (myId === statsReqId.current) {
          setStatsLoading(false);
        }
      }
    })();
    return () => {
      statsReqId.current += 1;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      memberStatsReqId.current += 1;
      setMeLoading(false);
      return;
    }
    const myId = ++memberStatsReqId.current;
    setMe(null);
    setMeError(null);
    setMeLoading(true);
    (async () => {
      try {
        const m = getWaitlistMemberSession();
        const codeForRequest = normalizeReferralCode(m?.referralCode ?? null);
        const res = await fetchWithTimeout("/api/waitlist/member-stats", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(codeForRequest ? { referralCode: codeForRequest } : {}),
        });
        let data: MePayload & {
          error?: string;
          code?: string;
          email?: string;
          displayName?: string;
          invitees?: InviteeRow[];
        };
        try {
          data = (await res.json()) as typeof data;
        } catch {
          if (myId !== memberStatsReqId.current) return;
          setMeError("Could not load your stats.");
          return;
        }
        if (myId !== memberStatsReqId.current) return;
        if (!res.ok) {
          if (res.status === 401 && data?.code === "SIGN_IN_REQUIRED") {
            setMeError("sign_in");
            return;
          }
          if (res.status === 400 && data?.code === "NO_AUTH_OR_CODE") {
            setMeError("personal");
            return;
          }
          setMeError(typeof data.error === "string" ? data.error : "Could not load your stats.");
          return;
        }
        if (data.status === "ok" && typeof data.referralCode === "string") {
          if (
            data.authSource === "session" &&
            typeof data.email === "string" &&
            !getWaitlistMemberSession()
          ) {
            setWaitlistMemberSession({
              email: data.email,
              name: typeof data.displayName === "string" && data.displayName ? data.displayName : "Waitlist member",
              avatarUrl: null,
              referralCode: data.referralCode,
              source: "form",
            });
          } else {
            const sess = getWaitlistMemberSession();
            if (sess?.email) {
              setWaitlistMemberSession({
                ...sess,
                referralCode: data.referralCode,
              });
            }
          }
          const invitees = Array.isArray(data.invitees) ? data.invitees : [];
          setMe({
            status: "ok",
            referralCode: data.referralCode,
            referralPoints: data.referralPoints,
            rank: data.rank,
            totalRanked: data.totalRanked,
            dbCount: data.dbCount,
            disqualified: data.disqualified,
            authSource: data.authSource,
            invitees,
          });
        } else {
          setMeError("Could not load your stats.");
        }
      } catch (e) {
        if (myId !== memberStatsReqId.current) return;
        setMeError(
          isTimeoutAbort(e) ? "Stats timed out. Check your connection and try again." : "Could not load your stats."
        );
      } finally {
        if (myId === memberStatsReqId.current) {
          setMeLoading(false);
        }
      }
    })();
    return () => {
      memberStatsReqId.current += 1;
    };
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const referralLinkCode =
    member?.referralCode ?? (me?.status === "ok" ? me.referralCode : undefined);

  const referralShareUrl = useSyncExternalStore(
    subscribePublicSiteOrigin,
    () => (referralLinkCode ? buildWaitlistReferralShareUrl(referralLinkCode) : ""),
    () =>
      referralLinkCode
        ? `${getPublicSiteOriginServerSnapshot()}/?ref=${encodeURIComponent(referralLinkCode)}`
        : ""
  );

  const lb = stats?.leaderboard ?? [];
  const top3 = lb.slice(0, 3);
  const restLb = lb.slice(3);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[220] flex min-h-[100dvh] items-center justify-center overflow-y-auto overscroll-contain px-4 py-[max(2.5rem,calc(env(safe-area-inset-top)+1.75rem))] pb-10 sm:px-6 sm:py-12 sm:pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 my-auto w-full max-w-[min(100%,480px)] max-h-[min(88dvh,760px)] overflow-y-auto rounded-[1.75rem] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_120px_-20px_rgba(0,0,0,0.85)]"
            style={{
              background:
                "linear-gradient(165deg, rgba(22,22,24,0.97) 0%, rgba(6,6,8,0.98) 45%, rgba(4,4,6,1) 100%)",
            }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="h-px w-full shrink-0 rounded-t-[1.75rem] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="size-5 text-white/80" aria-hidden />
                  <h2
                    className="text-lg font-semibold tracking-tight text-white sm:text-[1.15rem]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Leaderboard
                  </h2>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/45">
                  <Sparkles className="size-3 shrink-0 text-white/40" aria-hidden />
                  Every referral counts — top 3 win big at launch.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/65"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 px-5 pb-6">
              {referralLinkCode ? (
                <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                    <Link2 className="size-3 opacity-70" aria-hidden />
                    Your referral link
                  </div>
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1 truncate rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 font-mono text-[11px] text-white/65">
                      {referralShareUrl}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(referralShareUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch {
                          setCopied(false);
                        }
                      }}
                      className="shrink-0 rounded-lg bg-white px-3 text-[11px] font-semibold text-zinc-950 transition hover:bg-white/90"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ) : null}

              {meLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {(["Referrals", "Rank", "Waitlist"] as const).map((label) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent px-2 py-3 text-center"
                    >
                      <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/30">{label}</p>
                      <div className="mx-auto mt-2 h-7 w-10 rounded-md bg-white/[0.08] animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : me?.status === "ok" ? (
                <div>
                  {me.disqualified ? (
                    <p className="mb-3 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 text-center text-[11px] text-white/75">
                      Account under review — points may be paused.
                    </p>
                  ) : null}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Referrals", value: String(me.referralPoints), sub: "points" },
                      {
                        label: "Your rank",
                        value: me.rank != null ? `#${me.rank}` : "—",
                        sub: me.rank != null ? `of ${me.totalRanked}` : undefined,
                      },
                      { label: "Waitlist", value: String(me.dbCount), sub: "total" },
                    ].map((cell) => (
                      <div
                        key={cell.label}
                        className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-2 py-3 text-center"
                      >
                        <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">
                          {cell.label}
                        </p>
                        <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-white">{cell.value}</p>
                        {cell.sub ? <p className="mt-0.5 text-[9px] text-white/30">{cell.sub}</p> : null}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      <Users className="size-3.5 text-cyan-200/50" aria-hidden />
                      People you invited
                    </div>
                    {me.invitees.length === 0 ? (
                      <p className="text-[12px] leading-relaxed text-white/38">
                        Nobody yet — share your link. When friends join, they show up here with the email they used.
                      </p>
                    ) : (
                      <ul className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
                        {me.invitees.map((inv) => (
                          <li
                            key={`${inv.email}-${inv.joinedAt}`}
                            className="flex flex-col gap-0.5 rounded-xl border border-white/[0.05] bg-black/25 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-white/88">{inv.displayName}</p>
                              <p className="truncate font-mono text-[11px] text-white/40">{inv.email}</p>
                            </div>
                            <p className="shrink-0 text-[10px] text-white/30 sm:text-right">{formatJoined(inv.joinedAt)}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : meError === "sign_in" ? (
                <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-center">
                  <p className="text-[12px] leading-relaxed text-white/55">
                    Join the waitlist to get a referral link, then open Leaderboard again. Or sign in with the same email
                    you used on the waitlist to sync your stats across devices.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-zinc-950 transition hover:bg-white/90"
                    onClick={() => onClose()}
                  >
                    Sign in
                  </Link>
                </div>
              ) : meError === "personal" ? (
                <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center text-[12px] text-white/45">
                  Join the waitlist below, then open Leaderboard again to see your personal stats and rank.
                </p>
              ) : meError ? (
                <p className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-center text-[12px] text-red-200/80">
                  {meError}
                </p>
              ) : null}

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Live podium</p>
                {loadError ? (
                  <p className="text-[12px] text-white/35">{loadError}</p>
                ) : statsLoading ? (
                  <p className="text-[12px] text-white/35">Loading…</p>
                ) : !stats ? (
                  <p className="text-[12px] text-white/35">Could not load leaderboard.</p>
                ) : !stats.configured ? (
                  <p className="text-[12px] text-white/35">Unavailable.</p>
                ) : !stats.leaderboardEnabled ? (
                  <p className="text-[12px] text-white/35">Paused.</p>
                ) : lb.length === 0 ? (
                  <p className="text-[12px] text-white/38">No scores yet — be the first on the board.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-end justify-center gap-1.5 sm:gap-3">
                      {top3.length >= 3 ? (
                        <>
                          <PodiumCard row={top3[1]} accentClass={podiumBlockClass(2)} heightClass={podiumHeightClass(2)} />
                          <PodiumCard row={top3[0]} accentClass={podiumBlockClass(1)} heightClass={podiumHeightClass(1)} />
                          <PodiumCard row={top3[2]} accentClass={podiumBlockClass(3)} heightClass={podiumHeightClass(3)} />
                        </>
                      ) : top3.length === 2 ? (
                        <>
                          <PodiumCard row={top3[1]} accentClass={podiumBlockClass(2)} heightClass={podiumHeightClass(2)} />
                          <PodiumCard row={top3[0]} accentClass={podiumBlockClass(1)} heightClass={podiumHeightClass(1)} />
                        </>
                      ) : (
                        <PodiumCard row={top3[0]} accentClass={podiumBlockClass(1)} heightClass={podiumHeightClass(1)} />
                      )}
                    </div>

                    {restLb.length > 0 ? (
                      <div>
                        <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.16em] text-white/32">Closing in</p>
                        <ul className="space-y-1.5">
                          {restLb.map((row) => (
                            <li
                              key={row.rank}
                              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                            >
                              <span
                                className={`w-8 shrink-0 text-center text-sm font-bold tabular-nums ${rankAccent(row.rank)}`}
                              >
                                {row.rank}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[13px] text-white/85">{row.displayName}</span>
                              <span className="shrink-0 text-[12px] tabular-nums text-white/40">{row.referralPoints} pts</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <details className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-medium text-white/45 outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>Quick rules</span>
                  <ChevronDown className="size-4 shrink-0 text-white/35 transition group-open:rotate-180" />
                </summary>
                <ul className="mt-2 space-y-1.5 border-t border-white/[0.05] pt-2 text-[11px] leading-snug text-white/42">
                  <li className="flex gap-2">
                    <span className="text-white/50">•</span>
                    <span>1 point per new signup through your URL.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-white/50">•</span>
                    <span>
                      Top 3 on the pre-launch leaderboard get early access and complimentary Pro when KroniQ launches
                      (subject to fair-play review).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-white/50">•</span>
                    <span>Signing in with the same waitlist email syncs your link and stats across devices.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-white/50">•</span>
                    <span>No self-referrals or duplicate emails.</span>
                  </li>
                </ul>
              </details>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PodiumCard({
  row,
  accentClass,
  heightClass,
}: {
  row: { rank: number; displayName: string; referralPoints: number };
  accentClass: string;
  heightClass: string;
}) {
  const tier =
    row.rank === 1 ? "1st" : row.rank === 2 ? "2nd" : row.rank === 3 ? "3rd" : `#${row.rank}`;
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-xl border px-2 pb-3 pt-3 text-center ${accentClass} ${heightClass}`}
    >
      <span className={`text-lg font-bold tabular-nums ${rankAccent(row.rank)}`}>{tier}</span>
      <span className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight text-white/90">{row.displayName}</span>
      <span className="mt-auto pt-2 text-[11px] font-semibold tabular-nums text-white/50">{row.referralPoints} pts</span>
    </div>
  );
}
