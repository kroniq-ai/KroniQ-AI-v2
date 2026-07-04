"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export interface NotFoundLink {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    href: string;
}

export interface NotFoundProps {
    /** Custom error code to display */
    errorCode?: string;
    /** Main heading text */
    title?: string;
    /** Subtitle/description text */
    description?: string;
    /** Links to display below the main content */
    links?: NotFoundLink[];
    /** Handler for back button click */
    onBackClick?: () => void;
    /** Handler for home button click */
    onHomeClick?: () => void;
    /** Custom back button text */
    backButtonText?: string;
    /** Custom home button text */
    homeButtonText?: string;
    /** Show the grid background pattern */
    showBackground?: boolean;
    /** Additional CSS classes for the main container */
    className?: string;
    /** Children to render instead of default content */
    children?: ReactNode;
}

export function NotFound({
    errorCode = "404",
    title = "This page doesn’t exist",
    description = "The URL may be mistyped, or the page was moved. Let’s get you somewhere useful.",
    links = [],
    onBackClick,
    onHomeClick,
    backButtonText = "Go back",
    homeButtonText = "Back to home",
    showBackground = true,
    className,
    children,
}: NotFoundProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBackClick) onBackClick();
        else router.back();
    };

    return (
        <main
            className={cn(
                "relative flex min-h-[100dvh] w-full flex-col items-center justify-start overflow-hidden px-4 pb-[max(5rem,env(safe-area-inset-bottom))] pt-[max(5rem,env(safe-area-inset-top))] md:justify-center md:px-10 md:py-24",
                className
            )}
        >
            {showBackground ? (
                <>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-0 bg-[#020202]"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.4]"
                        style={{
                            background:
                                "radial-gradient(ellipse 90% 55% at 50% -15%, rgba(255,255,255,0.09), transparent 55%), radial-gradient(ellipse 70% 45% at 80% 90%, rgba(255,255,255,0.045), transparent 50%), radial-gradient(ellipse 50% 35% at 15% 75%, rgba(255,255,255,0.03), transparent 45%)",
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.35] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px] md:[background-size:56px_56px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,black_0%,transparent_72%)]"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[min(55vh,520px)] opacity-70"
                        style={{
                            background:
                                "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255,255,255,0.07), transparent 68%)",
                            filter: "blur(48px)",
                        }}
                    />
                </>
            ) : null}

            <section className="relative z-10 flex w-full max-w-xl flex-col items-center gap-10 md:max-w-2xl md:gap-14">
                {children || (
                    <>
                        <div
                            className={cn(
                                "w-full rounded-2xl border border-white/[0.08] bg-black/45 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl md:p-12",
                                "ring-1 ring-white/[0.04]"
                            )}
                        >
                            <div className="flex flex-col items-center gap-8 md:gap-10">
                                <header className="flex flex-col items-center gap-5 md:gap-6">
                                    <Badge
                                        variant="outline"
                                        className="gap-2 border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium tracking-wide text-foreground/90 backdrop-blur-sm"
                                    >
                                        <span
                                            className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(250,250,250,0.45)]"
                                            aria-hidden
                                        />
                                        {errorCode}
                                    </Badge>
                                    <div className="flex flex-col items-center gap-4 md:gap-5">
                                        <h1 className="text-balance text-center font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
                                            {title}
                                        </h1>
                                        <p className="max-w-md text-center text-base leading-relaxed text-muted-foreground md:text-lg">
                                            {description}
                                        </p>
                                    </div>
                                </header>

                                <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="h-11 w-full rounded-full border-white/15 bg-white/[0.03] sm:w-auto sm:min-w-[140px]"
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft className="mr-2 size-4 opacity-90" />
                                        {backButtonText}
                                    </Button>
                                    {onHomeClick ? (
                                        <Button
                                            type="button"
                                            size="lg"
                                            className="h-11 w-full rounded-full sm:w-auto sm:min-w-[160px]"
                                            onClick={onHomeClick}
                                        >
                                            {homeButtonText}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="h-11 w-full rounded-full sm:w-auto sm:min-w-[160px]"
                                            asChild
                                        >
                                            <Link href="/">{homeButtonText}</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {links.length > 0 ? (
                            <div className="w-full overflow-hidden rounded-xl border border-white/[0.07] bg-black/30 shadow-inner backdrop-blur-md">
                                <ul className="divide-y divide-white/[0.06]">
                                    {links.map((link) => (
                                        <li key={link.title}>
                                            <Link
                                                href={link.href}
                                                className="group flex flex-col gap-4 py-5 pl-4 pr-4 transition-colors hover:bg-white/[0.04] md:flex-row md:items-center md:gap-5 md:py-5 md:pl-5 md:pr-5"
                                            >
                                                <div className="flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-card/80 p-3 shadow-sm transition-colors group-hover:border-white/18">
                                                    <link.icon
                                                        className="size-5 text-foreground/85 md:size-6"
                                                        strokeWidth={1.5}
                                                        aria-hidden
                                                    />
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-6">
                                                    <div className="min-w-0 space-y-1">
                                                        <div className="text-base font-semibold tracking-tight text-foreground">
                                                            {link.title}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {link.subtitle}
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/80 md:mt-0" />
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </>
                )}
            </section>
        </main>
    );
}
