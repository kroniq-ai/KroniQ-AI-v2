"use client";

import { NotFound } from "@/components/ui/not-found-1";
import { BookOpen, HelpCircle, Layers } from "lucide-react";

const DEFAULT_LINKS = [
    {
        title: "Product",
        subtitle: "Lanes, context, and how KroniQ runs work",
        icon: Layers,
        href: "/#platform",
    },
    {
        title: "FAQ",
        subtitle: "Waitlist, access, and what to expect",
        icon: HelpCircle,
        href: "/#faq",
    },
    {
        title: "About",
        subtitle: "Why we built KroniQ",
        icon: BookOpen,
        href: "/about",
    },
];

export default function NotFoundPage() {
    return <NotFound links={DEFAULT_LINKS} />;
}
