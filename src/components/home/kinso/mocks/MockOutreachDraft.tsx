"use client";

import { motion } from "framer-motion";
import { SHOWCASE_FALLBACK_CLASS } from "../showcase-clip-styles";
import { KinsoAvatar } from "@/components/ui/kinso-showcase";

export function MockOutreachDraft() {
  return (
    <div className={SHOWCASE_FALLBACK_CLASS}>
        <div className="mb-4 flex items-center gap-3 border-b border-black/[0.06] pb-4">
          <KinsoAvatar initials="NC" ring="coral" className="size-10 text-[12px]" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-black/90">Natasha Corwin</p>
            <p className="text-[11px] text-black/40">VP Growth · Series A SaaS</p>
          </div>
          <span className="rounded-lg bg-[#EA4335]/10 px-2 py-1 text-[10px] font-bold text-[#EA4335]">
            Gmail
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
          <motion.div
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-400"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 100%" }}
          />
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-500/80">
            Auto drafting outreach…
          </p>
          <p className="text-[13px] leading-relaxed text-black/75">
            Hey Natasha — saw your post on scaling outbound without adding headcount. We help founders
            run research + sequences autonomously;{" "}
            <span className="font-semibold text-black/90">happy to share how teams your size pilot it</span>
            …
          </p>
          <div className="mt-3 flex gap-2">
            {["ICP fit: 92", "Strategy: warm-post"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-black/35">
          <span>Voice match · Direct, technical</span>
          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-medium">Approve →</span>
        </div>
    </div>
  );
}
