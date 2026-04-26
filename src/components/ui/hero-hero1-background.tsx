import { cn } from "@/lib/utils";

type Props = {
    className?: string;
};

/**
 * Decorative layers from the hero-1 template: radial top wash + vertical column rules.
 * Pointer-events none — interactive layer sits above this.
 */
export function HeroHero1Background({ className }: Props) {
    return (
        <div
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
        >
            <div className="absolute inset-0 mx-auto hidden min-h-screen w-full max-w-5xl lg:block">
                <div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 left-0 z-10 h-full w-px bg-foreground/15" />
                <div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 right-0 z-10 h-full w-px bg-foreground/15" />
            </div>

            <div className="absolute inset-0 -z-[1] size-full overflow-hidden">
                <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
                <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
                <div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
                <div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
            </div>
        </div>
    );
}
