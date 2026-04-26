"use client";

import { KroniqWordmark } from "@/components/brand/kroniq-mark";
import { ShaderAnimation } from "@/components/ui/shader-lines";

/** Next.js `app/loading.tsx` — route fallback; same `variant="loading"` shader as intro. */
export default function RouteLoadingView() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black">
            <div className="pointer-events-none absolute inset-0 z-0 bg-black" aria-hidden />
            <div className="absolute inset-0 z-[1] flex items-stretch justify-stretch">
                <ShaderAnimation
                    variant="loading"
                    monochrome
                    maxDpr={1}
                    renderScale={0.4}
                    fpsCap={24}
                    className="h-full min-h-[100dvh] w-full min-w-full flex-1 opacity-[0.9]"
                />
            </div>
            <div className="relative z-10 flex items-center justify-center px-4">
                <KroniqWordmark
                    iconSize={28}
                    variant="mono"
                    className="text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.12)]"
                />
            </div>
        </div>
    );
}
