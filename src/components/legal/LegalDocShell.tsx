import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LegalDocShellProps = {
    title: string;
    lastUpdated: string;
    children: ReactNode;
    className?: string;
};

/**
 * Shared chrome for Privacy / Terms — matches marketing dark theme without pulling in full landing layout noise.
 */
export function LegalDocShell({ title, lastUpdated, children, className }: LegalDocShellProps) {
    return (
        <div className="relative min-h-screen bg-black text-foreground">
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]"
            />
            <main
                className={cn(
                    "relative z-[1] mx-auto min-h-screen max-w-3xl px-6 py-20 pb-[max(6.5rem,env(safe-area-inset-bottom)+5.25rem)] md:py-28",
                    className
                )}
            >
                <nav className="mb-10 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
                        <span aria-hidden>←</span> Home
                    </Link>
                    <span className="text-white/15" aria-hidden>
                        |
                    </span>
                    <Link href="/privacy" className="transition-colors hover:text-foreground">
                        Privacy
                    </Link>
                    <Link href="/terms" className="transition-colors hover:text-foreground">
                        Terms
                    </Link>
                </nav>

                <header className="mb-10 border-b border-white/[0.08] pb-8">
                    <h1
                        className="text-3xl font-semibold tracking-tight text-white md:text-[2rem]"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        {title}
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
                </header>

                <div className="legal-doc-content max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline">
                    {children}
                </div>
            </main>
        </div>
    );
}
