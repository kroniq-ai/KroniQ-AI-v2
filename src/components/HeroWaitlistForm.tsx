"use client";

import { getWaitlistMemberSession, setWaitlistMemberSession } from "@/lib/waitlist/client-session";
import { requestLaunchAccess } from "@/lib/launch-access-client";
import { fetchWithTimeout, isTimeoutAbort } from "@/lib/waitlist/client-fetch";
import { formatWaitlistClientError } from "@/lib/waitlist/client-waitlist-error";
import { isDisposableEmailDomain, isValidEmailForSignup } from "@/lib/waitlist/email-validation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { glassDark } from "@/components/ui/glass-surface";
import { motion } from "framer-motion";

const EXTRA_OPEN = "voyd-waitlist-extra-open";

function validateEmailInput(raw: string): string | null {
  const t = raw.trim();
  if (!t) return "Enter your email.";
  if (!isValidEmailForSignup(t)) return "That doesn't look like a valid email address.";
  if (isDisposableEmailDomain(t)) return "Please use a permanent email address.";
  return null;
}

type HeroWaitlistFormProps = { className?: string };

export function HeroWaitlistForm({ className }: HeroWaitlistFormProps) {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const m = getWaitlistMemberSession();
    if (m?.email) {
      setDone(true);
      setAlreadyJoined(true);
    }
  }, []);

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    const localErr = validateEmailInput(trimmed);
    if (localErr) {
      setError(localErr);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetchWithTimeout("/api/waitlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, quickJoin: true }),
      });
      if (!mounted.current) return;
      const data = (await res.json()) as {
        status?: string;
        error?: string;
        retryAfterSec?: number;
      };
      if (!mounted.current) return;
      if (!res.ok) {
        if (res.status === 429) setError(`Too many attempts. Try again in ${data.retryAfterSec ?? 60}s.`);
        else setError(formatWaitlistClientError(data.error ?? "Something went wrong", res.status));
        return;
      }
      const dup = data.status === "duplicate";
      setAlreadyJoined(dup);
      setWaitlistMemberSession({
        email: trimmed,
        name: "Waitlist member",
        avatarUrl: null,
        referralCode: null,
        source: "form",
      });
      void requestLaunchAccess(trimmed);
      setDone(true);
      window.dispatchEvent(new CustomEvent(EXTRA_OPEN, { detail: { email: trimmed } }));
    } catch (e) {
      if (mounted.current) {
        setError(
          isTimeoutAbort(e) ? "Request timed out. Check your connection and try again." : "Something went wrong. Try again.",
        );
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {!done && (
        <form onSubmit={joinWaitlist} className="relative">
          <div className={glassDark.inputShell}>
            <label className="sr-only" htmlFor="hero-waitlist-email">
              Email address
            </label>
            <input
              id="hero-waitlist-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched) setError("");
              }}
              onBlur={() => setTouched(true)}
              disabled={busy}
              className={glassDark.input}
            />
            <div className="flex shrink-0 items-center justify-center sm:pr-0.5">
              {busy ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-[3rem] cursor-not-allowed items-center justify-center rounded-full bg-white/50 px-7 text-[14px] font-bold text-black"
                >
                  …
                </button>
              ) : (
                <LiquidMetalButton label="Join Waitlist" />
              )}
            </div>
          </div>
        </form>
      )}

      {error ? (
        <p className="mt-3 text-center text-[13px] text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {!done && (
        <p className="mt-3 text-center text-[11px] text-white/25">No spam · Unsubscribe anytime · Private beta</p>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-2 flex w-full flex-col items-center gap-3 rounded-[28px] p-6 text-center ${glassDark.pill} !rounded-[28px] px-6 py-7`}
        >
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
            <Check className="size-7 text-white" strokeWidth={3} aria-hidden />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-white">
              {alreadyJoined ? "You're already on the list!" : "You're on the waitlist!"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-white/45">
              We&apos;ll email you when your spot opens. Watch your inbox for the invite.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
