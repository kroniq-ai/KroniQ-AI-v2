"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export type LogoCloudLogo = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
};

export type LogoCloudProps = ComponentProps<"div"> & {
    logos: LogoCloudLogo[];
    /** Seconds per loop segment — higher = slower drift */
    duration?: number;
    durationOnHover?: number;
};

export function LogoCloud({
    logos,
    className,
    duration = 55,
    durationOnHover = 22,
    ...props
}: LogoCloudProps) {
    return (
        <div
            className={cn(
                "relative mx-auto max-w-3xl bg-gradient-to-r from-secondary via-transparent to-secondary py-6 md:border-x",
                className
            )}
            {...props}
        >
            <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t border-border/40" />

            <InfiniteSlider gap={42} reverse duration={duration} durationOnHover={durationOnHover}>
                {logos.map((logo) => (
                    // eslint-disable-next-line @next/next/no-img-element -- external SVG wordmarks; no next/image optimizer benefit
                    <img
                        alt={logo.alt}
                        className="pointer-events-none h-4 select-none opacity-80 md:h-5 dark:brightness-0 dark:invert"
                        height={logo.height ?? "auto"}
                        key={`logo-${logo.alt}`}
                        loading="lazy"
                        src={logo.src}
                        width={logo.width ?? "auto"}
                    />
                ))}
            </InfiniteSlider>

            <ProgressiveBlur
                blurIntensity={1}
                className="pointer-events-none absolute left-0 top-0 h-full w-[min(28vw,160px)]"
                direction="left"
            />
            <ProgressiveBlur
                blurIntensity={1}
                className="pointer-events-none absolute right-0 top-0 h-full w-[min(28vw,160px)]"
                direction="right"
            />

            <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b border-border/40" />
        </div>
    );
}
