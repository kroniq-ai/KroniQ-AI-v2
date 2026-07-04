"use client";

import Link from "next/link";
import { PilotLoginLink } from "@/components/PilotLoginLink";
import { KroniQWordmarkOnDark } from "@/components/brand/kroniq-logo-png";

const FOOTER_LINKS = {
  product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Integrations", href: "#integrations" },
    { label: "FAQ", href: "#faq" },
  ],
  legal: [
    { label: "Terms of Use", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  about: [
    { label: "Contact", href: "mailto:hello@kroniq.io" },
    { label: "Discord", href: "https://discord.gg/CbgH53Fnpz", external: true },
  ],
} as const;

const SOCIAL = [
  { label: "Discord", href: "https://discord.gg/CbgH53Fnpz", icon: "discord" },
  { label: "X / Twitter", href: "https://x.com", icon: "x" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
] as const;

function SocialIcon({ type }: { type: string }) {
  if (type === "discord") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.032.052a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.04.001-.088-.041-.104a13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    );
  }
  if (type === "linkedin") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

/** Kinso-style clean footer */
export function KinsoFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-black text-white">
      <div className="section-container mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <KroniQWordmarkOnDark className="h-7 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              One autonomous CMO for outreach, content, lead sourcing, and daily growth audits.
            </p>
            <PilotLoginLink className="mt-5 inline-block text-sm font-medium text-white/40 transition hover:text-white/70">
              Pilot login →
            </PilotLoginLink>
          </div>

          {(
            [
              ["Product", FOOTER_LINKS.product],
              ["Legal", FOOTER_LINKS.legal],
              ["About", FOOTER_LINKS.about],
            ] as const
          ).map(([heading, links]) => (
            <div key={heading}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/55 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-white/55 transition hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/70 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
            >
              <SocialIcon type={s.icon} />
              {s.label}
            </a>
          ))}
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-8 text-center text-[12px] text-white/30">
          <p>© {new Date().getFullYear()} KroniQ. All rights reserved.</p>
          <p className="mt-1">
            <a href="mailto:hello@kroniq.io" className="transition hover:text-white/50">
              hello@kroniq.io
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
