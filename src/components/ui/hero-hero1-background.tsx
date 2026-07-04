"use client";

/**
 * Hero background — Hero2-style gradient blobs on deep black.
 * Purple/sky · Pink/yellow · Yellow/sky + fine grain texture
 */
export function HeroHero1Background() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Deep black base */}
            <div className="absolute inset-0" style={{ background: "#050508" }} />

            {/* Blob 1 — purple → sky (top-right, like Hero2) */}
            <div
                className="absolute"
                style={{
                    top: "-120px",
                    right: "-200px",
                    width: "700px",
                    height: "340px",
                    borderRadius: "9999px",
                    background: "linear-gradient(180deg, #7C3AED 0%, #0EA5E9 100%)",
                    filter: "blur(90px)",
                    opacity: 0.32,
                }}
            />

            {/* Blob 2 — pink → amber (wider, slightly lower) */}
            <div
                className="absolute"
                style={{
                    top: "60px",
                    right: "-320px",
                    width: "900px",
                    height: "300px",
                    borderRadius: "9999px",
                    background: "linear-gradient(180deg, #831843 0%, #F59E0B 100%)",
                    filter: "blur(90px)",
                    opacity: 0.22,
                }}
            />

            {/* Blob 3 — amber → sky (narrower, further down) */}
            <div
                className="absolute"
                style={{
                    top: "220px",
                    right: "-180px",
                    width: "600px",
                    height: "280px",
                    borderRadius: "9999px",
                    background: "linear-gradient(180deg, #D97706 0%, #38BDF8 100%)",
                    filter: "blur(90px)",
                    opacity: 0.18,
                }}
            />

            {/* Subtle emerald brand glow — left/center (brand identity) */}
            <div
                className="absolute"
                style={{
                    top: "10%",
                    left: "-80px",
                    width: "400px",
                    height: "400px",
                    borderRadius: "9999px",
                    background: "radial-gradient(ellipse, rgba(16,185,129,0.14) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            {/* CSS grid overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                }}
            />

            {/* Grain/noise texture — Hero2 exact */}
            <div className="absolute inset-0 bg-noise opacity-20" />

            {/* Bottom fade to section bg */}
            <div
                className="absolute bottom-0 left-0 right-0 h-40"
                style={{ background: "linear-gradient(to bottom, transparent, #0A0A0A)" }}
            />
        </div>
    );
}
