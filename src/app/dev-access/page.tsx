"use client";

import { useState } from "react";
import Link from "next/link";

export default function DevAccessPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/dev-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Access denied");
        return;
      }
      window.location.href = "/login";
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <p className="text-white/50 text-sm mb-8">
        <Link href="/" className="hover:text-white/80 transition">
          ← Back to home
        </Link>
      </p>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-xl font-semibold mb-2">Team access</h1>
        <p className="text-white/50 text-sm mb-6">
          Enter the development password to sign in to the app.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/25"
          />
          {error && <p className="text-neutral-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 transition"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
