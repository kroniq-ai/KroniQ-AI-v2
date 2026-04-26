"use client";

import { BrightSectionBackdrop } from "@/components/home/BrightSectionBackdrop";
import { EngravedString } from "@/components/ui/interactive-string";
import { cn } from "@/lib/utils";

export type HeroInteractiveBackdropProps = {
    /** Short label used for the engraved line-art (e.g. brand monogram). */
    brandName: string;
    className?: string;
};

/**
 * Chromatic wash + subtle line-art (no thermal gray heat-map).
 * Parent section must be `position: relative` (captures pointer for `pointerEventsRoot="parent"`).
 */
export function HeroInteractiveBackdrop({ brandName, className }: HeroInteractiveBackdropProps) {
    return (
        <>
            <BrightSectionBackdrop className={cn("!z-0 opacity-[0.85]", className)} />
            <EngravedString
                text={brandName}
                interaction="parent"
                className="absolute inset-0 z-[1] opacity-[0.09] mix-blend-soft-light dark:opacity-[0.12]"
                canvasClassName="opacity-95"
            />
        </>
    );
}
