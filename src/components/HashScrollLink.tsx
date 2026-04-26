"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, type ReactNode, type MouseEvent } from "react";

type Props = {
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * In-page `/#id` links on the home page should not go through a Next client transition
 * (that re-runs RSC and shows `app/loading.tsx` — feels slow and shows a spinner on click).
 * Same path: `preventDefault` + `scrollIntoView` so navigation is instant.
 */
export function HashScrollLink({ href, className, children, onClick }: Props) {
    const pathname = usePathname();
    const isHashOnHome = href.startsWith("/#");
    const targetId = isHashOnHome ? href.replace("/#", "") : "";
    const isOnHome = pathname === "/";

    const scrollToId = useCallback(() => {
        if (!targetId) return;
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [targetId]);

    const onNavClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>) => {
            onClick?.(e);
            if (e.defaultPrevented) return;
            if (!isHashOnHome || !isOnHome) return;
            e.preventDefault();
            scrollToId();
        },
        [isHashOnHome, isOnHome, onClick, scrollToId]
    );

    if (isHashOnHome && isOnHome) {
        return (
            <a href={href} className={className} onClick={onNavClick}>
                {children}
            </a>
        );
    }

    if (isHashOnHome) {
        return (
            <Link href={href} className={className} scroll={true} onClick={onClick}>
                {children}
            </Link>
        );
    }

    return (
        <Link href={href} className={className} onClick={onClick}>
            {children}
        </Link>
    );
}
