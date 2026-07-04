import { cn } from "@/lib/utils";
import * as React from "react";

type FrameProps = {
    className?: string;
    children: React.ReactNode;
    label?: string;
    density?: "comfortable" | "compact";
};

export function KroniqBrowserFrame({ className, children, label = "KroniQ", density = "comfortable" }: FrameProps) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#020203] shadow-[0_32px_80px_rgba(0,0,0,0.65)]",
                className
            )}
        >
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
                <span className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#FF5F56]/80" />
                    <span className="size-2.5 rounded-full bg-[#FFBD2E]/80" />
                    <span className="size-2.5 rounded-full bg-[#27C93F]/70" />
                </span>
                <div className="ml-2 min-w-0 flex-1 truncate rounded-md border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-left text-[10px] text-white/30">
                    {label}
                </div>
            </div>
            <div className={cn("relative", density === "compact" ? "p-2 sm:p-3" : "p-3 sm:p-4 md:p-5")}>
                {children}
            </div>
        </div>
    );
}

const bar = (w: string, color = "bg-white/[0.1]") => (
    <div className={cn("h-1.5 rounded-sm", color, w)} />
);

function DarkPanel({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn("rounded-xl border border-white/[0.06] p-3", className)} style={{ background: "rgba(255,255,255,0.04)" }}>
            {children}
        </div>
    );
}

export function HeroProductInterior() {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.14em] text-white/30 sm:text-[10px]">
                <span>Active mission</span>
                <span className="text-emerald-400 font-semibold">Queue · 12 pending</span>
            </div>
            <div className="grid grid-cols-12 gap-2.5">
                <DarkPanel className="col-span-7 sm:col-span-8 min-h-[100px] sm:min-h-[120px]">
                    <div className="mb-2 h-1 w-1/3 rounded-sm bg-gradient-to-r from-emerald-500/80 to-cyan-400/60" />
                    <div className="space-y-2">{bar("w-3/4")}{bar("w-full")}{bar("w-5/6")}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-white/40">ICP</span>
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-white/40">Tone</span>
                        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.12] px-1.5 py-0.5 text-[8px] text-emerald-400">Live</span>
                    </div>
                </DarkPanel>
                <div className="col-span-5 sm:col-span-4 flex flex-col gap-2.5">
                    <DarkPanel className="flex-1 p-2.5">
                        <div className="h-1 w-1/2 rounded-sm bg-white/[0.12]" />
                        <div className="mt-2 space-y-1.5">{bar("w-full")}{bar("w-2/3")}</div>
                    </DarkPanel>
                    <DarkPanel className="p-2.5">
                        <div className="text-[8px] text-white/30">This week</div>
                        <div className="mt-0.5 text-sm font-bold text-emerald-400">+18%</div>
                    </DarkPanel>
                </div>
            </div>
        </div>
    );
}

export function MockActionQueue() {
    return (
        <div className="space-y-2 p-0.5">
            {[{ c: "bg-emerald-400" }, { c: "bg-cyan-400" }, { c: "bg-amber-400" }].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                    <div className={cn("size-1.5 shrink-0 rounded-full", item.c)} />
                    <div className="h-1.5 min-w-0 flex-1 rounded-sm bg-white/[0.1]" />
                    <div className="h-5 w-14 shrink-0 rounded-md bg-white/[0.06] border border-white/[0.06]" />
                </div>
            ))}
        </div>
    );
}

export function MockLeads() {
    return (
        <div className="space-y-1.5 p-0.5">
            <div className="h-1.5 w-1/3 rounded-sm bg-teal-400/50" />
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-1.5 border-b border-white/[0.04] py-1 last:border-0">
                    <div className="col-span-4 h-1.5 rounded-sm bg-white/[0.1]" />
                    <div className="col-span-5 h-1.5 rounded-sm bg-white/[0.08]" />
                    <div className="col-span-3 h-1.5 rounded-sm bg-white/[0.12]" />
                </div>
            ))}
        </div>
    );
}

export function MockMemoryLoop() {
    return (
        <div className="flex flex-col items-center gap-2 p-1 py-2">
            <div className="relative">
                <div className="h-12 w-12 rounded-full border border-dashed border-emerald-400/40 animate-spin" style={{ animationDuration: "8s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
                </div>
            </div>
            <div className="flex gap-0.5 text-[7px] text-white/30">
                <span>outcome</span>→<span>memory</span>→<span>next</span>
            </div>
        </div>
    );
}

export function MockOneMemory() {
    return (
        <div className="space-y-2 p-0.5">
            <DarkPanel>{bar("w-2/3")}{bar("w-full")}</DarkPanel>
            <div className="grid grid-cols-2 gap-1.5">
                <div className="h-8 rounded-xl border border-violet-500/25 bg-violet-500/[0.08]" />
                <div className="h-8 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08]" />
            </div>
        </div>
    );
}

export function MockParallel() {
    const lanes = [
        { id: "res", name: "Research", color: "text-teal-400" },
        { id: "out", name: "Outreach", color: "text-emerald-400" },
        { id: "con", name: "Content", color: "text-amber-400" },
    ] as const;
    return (
        <div className="grid grid-cols-3 gap-1.5 p-0.5">
            {lanes.map((lane) => (
                <div key={lane.id} className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2">
                    <div className={cn("text-[6px] font-bold uppercase tracking-wide sm:text-[7px]", lane.color)}>{lane.name}</div>
                    {bar("w-full")}{bar("w-3/4")}
                </div>
            ))}
        </div>
    );
}

export function MockOvernight() {
    return (
        <div className="flex flex-col items-center justify-center gap-2 p-1 py-3">
            <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-indigo-400/60 via-white/20 to-amber-400/50" />
            <div className="text-center text-[8px] text-white/35">Ready when you are</div>
        </div>
    );
}

export function MockMissionCommand() {
    return (
        <div className="space-y-2 p-0.5">
            <div className="h-1.5 w-2/5 rounded-sm bg-gradient-to-r from-amber-500/60 to-yellow-400/40" />
            <div className="mt-2 grid grid-cols-3 gap-1.5">
                <div className="h-8 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08]" />
                <div className="h-8 rounded-lg border border-white/[0.06] bg-white/[0.03]" />
                <div className="h-8 rounded-lg border border-white/[0.06] bg-white/[0.03]" />
            </div>
            {bar("w-full")}{bar("w-4/5")}
        </div>
    );
}
