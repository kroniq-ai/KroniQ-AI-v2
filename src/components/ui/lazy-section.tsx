"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LazySectionProps {
    children: ReactNode;
    /** Estimated height for the placeholder before content mounts. Prevents layout jump. */
    placeholderHeight?: string;
    /** How far from viewport to start mounting. Default: 400px */
    rootMargin?: string;
    /** How far past the viewport before unmounting. null = never unmount. Default: 2000px */
    unloadMargin?: number;
    className?: string;
    /**
     * When set, the pre-mount placeholder gets this `id` so `/#anchor` links and
     * `document.getElementById` work even before children mount (e.g. footer nav to FAQ).
     */
    anchorId?: string;
    /** Applied to the placeholder for `scroll-margin` / header offset. */
    anchorClassName?: string;
}

/**
 * Mounts its children only when the section is within `rootMargin` of the viewport.
 * Renders a same-height placeholder while offscreen to prevent layout thrashing.
 * Optionally unmounts again when the user scrolls far past it.
 */
export function LazySection({
    children,
    placeholderHeight = "600px",
    rootMargin = "400px 0px",
    className,
    anchorId,
    anchorClassName = "scroll-mt-24",
}: LazySectionProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [lockedHeight, setLockedHeight] = useState<string | null>(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            // If IO not available just always show
            setMounted(true);
            return;
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setMounted(true);
                }
            },
            { rootMargin, threshold: 0 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [rootMargin]);

    // Once mounted and rendered, record actual height so the placeholder is accurate next time
    useEffect(() => {
        if (!mounted || !contentRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const h = entry.contentRect.height;
            if (h > 0) setLockedHeight(`${Math.round(h)}px`);
        });
        ro.observe(contentRef.current);
        return () => ro.disconnect();
    }, [mounted]);

    if (!mounted) {
        return (
            <div
                ref={sentinelRef}
                id={anchorId}
                className={cn(className, anchorId && anchorClassName)}
                style={{ minHeight: lockedHeight ?? placeholderHeight }}
                aria-hidden
            />
        );
    }

    return (
        <div ref={contentRef} className={className}>
            {children}
        </div>
    );
}
