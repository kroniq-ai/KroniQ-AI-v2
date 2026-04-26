"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lenis was removed: a permanent requestAnimationFrame loop + heavy GPU layers caused visible hitching
 * (main thread vs compositor). Native scroll + `scroll-behavior: smooth` on `html` is lighter and steadier.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAppRoute = ["/dashboard", "/project", "/login", "/signup"].some(
        (r) => pathname === r || pathname.startsWith(r + "/")
    );

    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;
        if (isAppRoute) {
            root.style.scrollBehavior = "auto";
            return;
        }
        root.style.scrollBehavior = "smooth";
        return () => {
            root.style.scrollBehavior = "";
        };
    }, [isAppRoute]);

    return <>{children}</>;
}
