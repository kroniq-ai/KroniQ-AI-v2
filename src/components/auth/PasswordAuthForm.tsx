"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginAppUrl } from "@/lib/app-url";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { glassDark } from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

function safeNextPath(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

function friendlyAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "Wrong email or password. Check what we sent your team.";
  }
  return message;
}

export function PasswordAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (err) {
        setError(friendlyAuthError(err.message));
        return;
      }

      const appDest = getPostLoginAppUrl(nextPath ?? undefined);
      if (appDest) {
        window.location.href = appDest;
        return;
      }

      router.replace(nextPath ?? "/dashboard");
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={signIn} className="space-y-4">
        <div className="space-y-2">
          <label className="sr-only" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className={cn(glassDark.input, "w-full !rounded-2xl")}
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="sr-only" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={cn(glassDark.input, "w-full !rounded-2xl")}
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {error ? (
          <p className="text-center text-[13px] text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-center pt-1">
          {loading ? (
            <button
              type="button"
              disabled
              className="inline-flex min-h-[3rem] cursor-not-allowed items-center justify-center rounded-full bg-white/50 px-8 text-[14px] font-bold text-black"
            >
              …
            </button>
          ) : (
            <LiquidMetalButton label="Sign in" />
          )}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-white/30">
          Invite-only pilot. Use the email and password we sent your team.
        </p>
      </form>
    </div>
  );
}
