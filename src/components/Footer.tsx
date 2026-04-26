"use client";

import { Mail, MessageCircle } from "lucide-react";
import { KroniQMarkBadgePng, KroniQWordmarkOnDark } from "@/components/brand/kroniq-logo-png";
import { ModemAnimatedFooter } from "@/components/ui/modem-animated-footer";

const NAV_LINKS = [
    { label: "Product", href: "/#platform" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
    { label: "Waitlist", href: "/#waitlist" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];

const SOCIAL_LINKS = [
    {
        icon: <Mail className="h-6 w-6" />,
        href: "mailto:atirek.sd11@gmail.com",
        label: "Email",
    },
    {
        icon: <MessageCircle className="h-6 w-6" />,
        href: "https://discord.gg/CbgH53Fnpz",
        label: "Discord — KroniQ Community",
    },
];

export default function Footer() {
    return (
        <div className="relative z-10 pt-8 md:pt-14">
            <ModemAnimatedFooter
                className="relative z-10"
                brandName="KroniQ"
                brandTitle={
                    <div className="flex w-full max-w-2xl justify-center px-2">
                        <KroniQWordmarkOnDark className="h-12 w-auto max-w-[min(92vw,24rem)] object-contain object-center sm:h-14 md:h-16" />
                    </div>
                }
                brandDescription="Your autonomous AI CMO for founder-led growth."
                navLinks={NAV_LINKS}
                socialLinks={SOCIAL_LINKS}
                brandIcon={<KroniQMarkBadgePng size={128} className="h-full w-full max-h-[8rem] object-contain" />}
            />
            <p className="mx-auto mt-6 max-w-lg px-4 pb-4 text-center text-xs leading-relaxed text-muted-foreground/70">
                Referral leaderboard: use <span className="text-muted-foreground">Leaderboard</span> in the bottom
                bar.
            </p>
        </div>
    );
}
