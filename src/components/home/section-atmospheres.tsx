"use client";

"use client";

/** Final CTA — static CSS glow (no WebGL; cheap paint). */
export function FinalCtaAtmosphere() {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-b from-[#010204] via-black to-[#020305]" />
            <div
                className="absolute -left-1/4 top-0 h-[70%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.12),transparent_80%)] blur-3xl"
                aria-hidden
            />
            <div
                className="absolute -right-1/4 bottom-0 h-[50%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.1),transparent_78%)] blur-3xl"
                aria-hidden
            />
            <div
                className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent"
                aria-hidden
            />
        </div>
    );
}
