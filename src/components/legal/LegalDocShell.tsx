import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { glassDark } from "@/components/ui/glass-surface";
import { KinsoKicker } from "@/components/ui/kinso-kicker";

type LegalDocShellProps = {
    title: string;
    lastUpdated?: string;
    children: ReactNode;
    className?: string;
    kicker?: string;
};

const NAV_LINKS = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Contact" },
] as const;

/**
 * Shared chrome for Privacy / Terms / Contact — dark marketing theme with glass nav.
 */
export function LegalDocShell({ title, lastUpdated, children, className, kicker = "Legal" }: LegalDocShellProps) {
    return (
        <div className="relative min-h-screen bg-black text-foreground">
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0 opacity-30"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]"
            />
            <main
                className={cn(
                    "relative z-[1] mx-auto min-h-screen max-w-3xl px-6 py-24 pb-[max(6.5rem,env(safe-area-inset-bottom)+5.25rem)] md:py-32",
                    className
                )}
            >
                <nav className="mb-10 flex flex-wrap items-center gap-3">
                    <Link href="/" className={cn(glassDark.button, "px-4 py-2 text-sm")}>
                        ← Home
                    </Link>
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className={cn(glassDark.navLink, "text-sm")}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <KinsoKicker label={kicker} variant="dark" className="justify-start" />

                <header className="mb-10 border-b border-white/[0.08] pb-8">
                    <h1
                        className="text-3xl font-semibold tracking-tight text-white md:text-[2rem]"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {title}
                    </h1>
                    {lastUpdated ? (
                        <p className="mt-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
                    ) : null}
                </header>

                <div className="legal-doc-content max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline">
                    {children}
                </div>
            </main>
        </div>
    );
}
