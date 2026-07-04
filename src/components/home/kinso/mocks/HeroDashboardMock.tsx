"use client";

import { useState } from "react";
import { KroniQMarkBadgePng } from "@/components/brand/kroniq-logo-png";

/** Premium in-code dashboard when `app-home.png` is not provided yet */
export function HeroDashboardMock() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] md:rounded-[28px] bg-[#08090a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />

      {/* Chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <span className="size-2 rounded-full bg-[#FF5F57]/90" />
        <span className="size-2 rounded-full bg-[#FEBC2E]/90" />
        <span className="size-2 rounded-full bg-[#28C840]/85" />
        <span className="ml-2 text-[10px] text-white/25">app.kroniqai.com · Home</span>
      </div>

      <div className="grid h-[calc(100%-40px)] grid-cols-12 gap-3 p-4">
        <div className="col-span-3 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2">
          {["Home", "Outreach", "Content", "Analytics", "Memory"].map((item, i) => (
            <div
              key={item}
              className={`rounded-lg px-2 py-1.5 text-[10px] font-medium ${i === 0 ? "bg-emerald-500/15 text-emerald-300" : "text-white/35"}`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="col-span-9 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KroniQMarkBadgePng size={20} className="grayscale brightness-110" />
              <span className="text-[12px] font-semibold text-white/80">Good morning — 12 actions queued</span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              Brain active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Outreach", val: "8 pending", c: "from-emerald-500/20" },
              { label: "Content", val: "1 brief", c: "from-orange-500/20" },
              { label: "Leads", val: "12 new", c: "from-cyan-500/20" },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-xl border border-white/[0.06] bg-gradient-to-br ${card.c} to-transparent p-3`}
              >
                <p className="text-[9px] uppercase tracking-wider text-white/35">{card.label}</p>
                <p className="mt-1 text-[13px] font-bold text-white/85">{card.val}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Today&apos;s audit</p>
            <div className="mt-2 space-y-1.5">
              {["Refresh hooks on Sequence B", "Publish proof post from win", "Approve 3 overnight leads"].map(
                (line) => (
                  <div key={line} className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-orange-400/80" />
                    <span className="text-[11px] text-white/55">{line}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export function HeroProductFrame() {
  const [useMock, setUseMock] = useState(false);

  return (
    <div className="relative z-10 p-2 md:p-3 rounded-[24px] md:rounded-[40px] bg-white/[0.04] border border-white/[0.1] shadow-[0_0_80px_-20px_rgba(255,255,255,0.15),0_40px_80px_-30px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <div className="absolute inset-0 rounded-[24px] md:rounded-[40px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
      {!useMock ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/app-home.png"
          alt="KroniQ autonomous CMO dashboard"
          className="w-full h-auto object-cover block rounded-[16px] md:rounded-[28px] border border-white/[0.06]"
          loading="eager"
          onError={() => setUseMock(true)}
        />
      ) : (
        <HeroDashboardMock />
      )}
    </div>
  );
}
