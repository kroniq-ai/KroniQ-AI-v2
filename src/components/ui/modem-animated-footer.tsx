"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { NotepadTextDashed } from "lucide-react";
import { HashScrollLink } from "@/components/HashScrollLink";
import { cn } from "@/lib/utils";

export type ModemFooterLink = {
    label: string;
    href: string;
};

export type ModemSocialLink = {
    icon: ReactNode;
    href: string;
    label: string;
};

export type ModemAnimatedFooterProps = {
    brandName?: string;
    /** Replaces the text `brandName` in the main heading (e.g. image wordmark). */
    brandTitle?: ReactNode;
    brandDescription?: string;
    socialLinks?: ModemSocialLink[];
    navLinks?: ModemFooterLink[];
    creatorName?: string;
    creatorUrl?: string;
    brandIcon?: ReactNode;
    className?: string;
};

export function ModemAnimatedFooter({
    brandName = "YourBrand",
    brandDescription = "Your description here",
    socialLinks = [],
    navLinks = [],
    creatorName,
    creatorUrl,
    brandIcon,
    brandTitle,
    className,
}: ModemAnimatedFooterProps) {
    return (
        <section className={cn("relative mt-0 w-full overflow-hidden", className)}>
            <footer className="relative mt-12 border-t border-border/40 bg-background sm:mt-16 md:mt-20">
                {/*
                 * Reserve bottom space for the absolute brand mark so copyright stays *above* it
                 * (abs children paint after in-flow; z-10 on the mark would cover text in the same band).
                 */}
                <div className="relative z-[1] mx-auto flex min-h-[28rem] max-w-7xl flex-col justify-between p-4 py-10 pb-36 sm:min-h-[32rem] sm:pb-40 md:min-h-[36rem] md:pb-44">
                    <div className="mb-12 flex w-full flex-col sm:mb-16 md:mb-0">
                        <div className="flex w-full flex-col items-center">
                            <div className="flex flex-1 flex-col items-center space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    {brandTitle ?? (
                                        <span
                                            className="text-3xl font-bold tracking-tight text-foreground"
                                            style={{ fontFamily: "var(--font-heading)" }}
                                        >
                                            {brandName}
                                        </span>
                                    )}
                                </div>
                                <p className="w-full max-w-sm px-4 text-center font-semibold text-muted-foreground sm:w-96 sm:px-0">
                                    {brandDescription}
                                </p>
                            </div>

                            {socialLinks.length > 0 ? (
                                <div className="mb-8 mt-3 flex gap-4">
                                    {socialLinks.map((link, index) => {
                                        const openExternal = link.href.startsWith("http");
                                        return (
                                        <Link
                                            key={`${link.href}-${index}`}
                                            href={link.href}
                                            className="text-muted-foreground transition-colors hover:text-foreground"
                                            target={openExternal ? "_blank" : undefined}
                                            rel={openExternal ? "noopener noreferrer" : undefined}
                                        >
                                            <div className="h-6 w-6 duration-300 hover:scale-110">{link.icon}</div>
                                            <span className="sr-only">{link.label}</span>
                                        </Link>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {navLinks.length > 0 ? (
                                <div className="flex max-w-full flex-wrap justify-center gap-x-5 gap-y-2 px-4 text-sm font-medium text-muted-foreground">
                                    {navLinks.map((link, index) => {
                                        const isHash = link.href.startsWith("/#");
                                        const C = isHash ? HashScrollLink : Link;
                                        return (
                                            <C
                                                key={`${link.href}-${index}`}
                                                className="duration-300 hover:font-semibold hover:text-foreground"
                                                href={link.href}
                                            >
                                                {link.label}
                                            </C>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="relative z-[2] mt-20 flex w-full flex-col items-center justify-center gap-3 px-4 text-center md:mt-28">
                        <p className="w-full text-base text-muted-foreground">
                            © {new Date().getFullYear()} {brandName}. All rights reserved.
                        </p>
                        {creatorName && creatorUrl ? (
                            <nav className="flex justify-center gap-4">
                                <Link
                                    href={creatorUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-muted-foreground transition-colors duration-300 hover:font-medium hover:text-foreground"
                                >
                                    Crafted by {creatorName}
                                </Link>
                            </nav>
                        ) : null}
                    </div>
                </div>

                <div
                    className="pointer-events-none absolute bottom-36 left-1/2 max-w-[95vw] -translate-x-1/2 select-none bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent bg-clip-text px-4 text-center font-extrabold leading-none tracking-tighter text-transparent md:bottom-28"
                    style={{
                        fontSize: "clamp(3rem, 12vw, 10rem)",
                    }}
                    aria-hidden
                >
                    {brandName.toUpperCase()}
                </div>

                <div className="absolute bottom-5 left-1/2 z-0 flex -translate-x-1/2 items-center justify-center rounded-3xl border-2 border-border bg-background/60 p-2.5 backdrop-blur-sm duration-300 hover:border-foreground/40 sm:bottom-4 sm:p-3 md:bottom-5">
                    <div
                        className={cn(
                            "flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-2xl sm:h-20 sm:w-20 md:h-28 md:w-28",
                            brandIcon
                                ? "bg-transparent p-0 shadow-lg ring-0"
                                : "bg-gradient-to-br from-foreground to-foreground/80 shadow-lg"
                        )}
                    >
                        {brandIcon ?? (
                            <NotepadTextDashed className="h-8 w-8 text-background drop-shadow-lg sm:h-10 sm:w-10 md:h-14 md:w-14" />
                        )}
                    </div>
                </div>

                <div className="absolute bottom-28 left-1/2 h-1 w-full max-w-[min(100%,72rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent backdrop-blur-sm sm:bottom-32" />

                <div className="pointer-events-none absolute bottom-24 h-24 w-full bg-gradient-to-t from-background via-background/80 to-background/40 blur-[1em]" />
            </footer>
        </section>
    );
}
