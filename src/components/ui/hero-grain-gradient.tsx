"use client";

/**
 * Hero background — CSS grain overlay on top of radial gradient blobs.
 * Replicates the @paper-design/shaders-react GrainGradient feel with zero dependencies.
 */
export function HeroGrainGradientBg() {
    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: "#000000" }}>
            {/* ── Radial gradient blobs ── */}
            {/* Emerald top-left */}
            <div style={{
                position: "absolute", top: "-15%", left: "-8%",
                width: "65vw", height: "65vw", maxWidth: "800px", maxHeight: "800px",
                borderRadius: "9999px",
                background: "radial-gradient(circle at 40% 40%, rgba(16,185,129,0.28) 0%, transparent 60%)",
                filter: "blur(72px)",
            }} />
            {/* Violet/indigo top-right */}
            <div style={{
                position: "absolute", top: "-20%", right: "-12%",
                width: "70vw", height: "70vw", maxWidth: "900px", maxHeight: "900px",
                borderRadius: "9999px",
                background: "radial-gradient(circle at 60% 40%, rgba(99,57,220,0.20) 0%, transparent 58%)",
                filter: "blur(90px)",
            }} />
            {/* Cyan center-bottom */}
            <div style={{
                position: "absolute", bottom: "0%", left: "30%",
                width: "55vw", height: "45vw", maxWidth: "700px", maxHeight: "560px",
                borderRadius: "9999px",
                background: "radial-gradient(circle at 50% 60%, rgba(34,211,238,0.12) 0%, transparent 60%)",
                filter: "blur(80px)",
            }} />

            {/* ── CSS grain texture (SVG turbulence) ── */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.25]" aria-hidden>
                <filter id="hero-grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#hero-grain)" />
            </svg>

            {/* Fine dot grid */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
            }} />
        </div>
    );
}
