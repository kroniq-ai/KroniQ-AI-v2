"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Crown, ArrowRight, Zap } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  referralShareUrl: string;
};

export default function ReferralOnboardingModal({ open, onClose, referralShareUrl }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex min-h-[100dvh] items-center justify-center px-4 py-[max(2.5rem,calc(env(safe-area-inset-top)+1.75rem))] pb-10 sm:px-6 sm:py-12 sm:pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 my-auto w-full max-w-[min(100%,540px)] overflow-hidden rounded-[2rem] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_32px_120px_-20px_rgba(0,0,0,1)]"
            style={{
              background: "linear-gradient(165deg, rgba(22,22,24,0.95) 0%, rgba(6,6,8,0.98) 50%, rgba(0,0,0,1) 100%)",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top glass highlight */}
            <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <Sparkles className="size-6 text-cyan-300" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
                  You&apos;re on the list!
                </h2>
                <p className="mt-2.5 text-[14px] leading-relaxed text-white/60">
                  Secure your spot at the top. The top 5 referrers win a <strong className="font-semibold text-white">6-Month KroniQ PRO</strong> membership and lifetime early access.
                </p>
              </div>

              {/* Mockup / "Screenshot" Graphic */}
              <div className="mx-auto mt-8 flex max-w-[360px] flex-col gap-3 rounded-2xl border border-white/[0.08] bg-black/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-transparent p-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <Crown className="size-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-amber-400">KroniQ PRO Access</p>
                    <p className="text-[12px] font-medium text-amber-200/60">6 Months Free for Top 5</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-transparent p-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-cyan-400">Early Access Pass</p>
                    <p className="text-[12px] font-medium text-cyan-200/60">Unlock new features first</p>
                  </div>
                </div>
              </div>

              {/* Link Box */}
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  Your Unique Referral Link
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center min-w-0 flex-1 truncate rounded-xl border border-white/[0.08] bg-black/50 px-4 py-3 font-mono text-[13px] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    {referralShareUrl}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!referralShareUrl) return;
                      try {
                        await navigator.clipboard.writeText(referralShareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch {
                        setCopied(false);
                      }
                    }}
                    className={`shrink-0 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[13px] font-bold transition-all duration-300 min-w-[120px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      copied 
                        ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400" 
                        : "bg-white text-black hover:bg-white/90"
                    }`}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={onClose}
                className="mx-auto mt-6 flex items-center justify-center gap-2 text-[13px] font-semibold text-white/40 transition hover:text-white/80"
              >
                Continue to Dashboard <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
