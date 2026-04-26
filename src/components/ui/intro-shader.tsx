"use client";

import { SmokeRing } from "@paper-design/shaders-react";

/**
 * Cinematic smoke ring — KroniQ slate + emerald wash palette.
 * Uses @paper-design/shaders-react (direct WebGL2, no Three.js).
 * Only ever imported via dynamic() in PageTransition.
 */
export function IntroShaderBackground() {
    return (
        <SmokeRing
            colorBack="#000000"
            colors={["#ffffff", "#c0c0c0", "#606060", "#1a1a1a99"]}
            speed={0.6}
            noiseScale={2.4}
            noiseIterations={7}
            thickness={0.68}
            radius={0.28}
            innerShape={0.52}
            scale={1.4}
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        />
    );
}
