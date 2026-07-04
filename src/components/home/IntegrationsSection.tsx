"use client";

import { useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import { FaLinkedinIn } from "react-icons/fa6";
import {
  SiAirtable,
  SiDiscord,
  SiGithub,
  SiGmail,
  SiGoogledrive,
  SiGoogleads,
  SiHubspot,
  SiInstagram,
  SiNotion,
  SiSlack,
  SiStripe,
  SiWhatsapp,
  SiX,
  SiYoutube,
  SiZapier,
} from "react-icons/si";
import { glassLight } from "@/components/ui/glass-surface";
import { KinsoKicker } from "@/components/ui/kinso-kicker";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import {
  RevealFade,
  RevealSlide,
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/scroll-reveal";

import { smoothScrollToId } from "@/lib/scroll/smooth-scroll-to";

function scrollToWaitlist() {
  smoothScrollToId("waitlist", -80);
}

const INTEGRATIONS: { Icon: IconType; label: string; color: string; glow: string }[] = [
  { Icon: SiGmail, label: "Gmail", color: "#EA4335", glow: "rgba(234,67,53,0.35)" },
  { Icon: FaLinkedinIn, label: "LinkedIn", color: "#0A66C2", glow: "rgba(10,102,194,0.35)" },
  { Icon: SiHubspot, label: "HubSpot", color: "#FF7A59", glow: "rgba(255,122,89,0.35)" },
  { Icon: SiSlack, label: "Slack", color: "#4A154B", glow: "rgba(74,21,75,0.3)" },
  { Icon: SiNotion, label: "Notion", color: "#000000", glow: "rgba(0,0,0,0.15)" },
  { Icon: SiX, label: "X", color: "#000000", glow: "rgba(0,0,0,0.12)" },
  { Icon: SiYoutube, label: "YouTube", color: "#FF0000", glow: "rgba(255,0,0,0.3)" },
  { Icon: SiStripe, label: "Stripe", color: "#635BFF", glow: "rgba(99,91,255,0.35)" },
  { Icon: SiGithub, label: "GitHub", color: "#181717", glow: "rgba(24,23,23,0.2)" },
  { Icon: SiWhatsapp, label: "WhatsApp", color: "#25D366", glow: "rgba(37,211,102,0.3)" },
  { Icon: SiDiscord, label: "Discord", color: "#5865F2", glow: "rgba(88,101,242,0.35)" },
  { Icon: SiGoogledrive, label: "Google Drive", color: "#4285F4", glow: "rgba(66,133,244,0.3)" },
  { Icon: SiGoogleads, label: "Google Ads", color: "#4285F4", glow: "rgba(66,133,244,0.3)" },
  { Icon: SiZapier, label: "Zapier", color: "#FF4A00", glow: "rgba(255,74,0,0.3)" },
  { Icon: SiAirtable, label: "Airtable", color: "#18BFFF", glow: "rgba(24,191,255,0.3)" },
  { Icon: SiInstagram, label: "Instagram", color: "#E4405F", glow: "rgba(228,64,95,0.3)" },
];

function GlowIcon({ Icon, label, color, glow }: { Icon: IconType; label: string; color: string; glow: string }) {
  return (
    <RevealStaggerItem>
      <div className="group relative" title={label}>
        <div
          className="pointer-events-none absolute -inset-2 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
          aria-hidden
        />
        <div className={glassLight.iconTile}>
          <Icon className="h-5 w-5" style={{ color }} aria-hidden />
          <span className="sr-only">{label}</span>
        </div>
      </div>
    </RevealStaggerItem>
  );
}

export function IntegrationsSection({ theme = "light" }: { theme?: "light" | "dark" }) {
  const reduce = useReducedMotion();
  const isLight = theme !== "dark";

  if (reduce) {
    return (
      <section className="py-10 text-center" style={{ background: isLight ? "#fafafa" : "#000" }}>
        <p className="text-xs text-black/40">10+ integrations</p>
      </section>
    );
  }

  return (
    <section
      id="integrations"
      data-nav-theme="light"
      className="light-zone relative scroll-mt-20 px-6 pb-16 pt-2 md:pb-24 md:pt-4"
      style={{ background: isLight ? "#fafafa" : "#000" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 85% 10%, rgba(251,146,60,0.08) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 10% 30%, rgba(34,211,238,0.07) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className={`relative mx-auto max-w-7xl ${glassLight.card} overflow-hidden p-6 md:p-10 lg:p-12`}>
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/70"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(251,146,95,0.14) 0%, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative z-10 grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <RevealFade delay={0}>
              <KinsoKicker label="Integrations" />
            </RevealFade>
            <RevealFade delay={0.06}>
              <h2
                className="text-4xl font-bold leading-[1.05] tracking-tight text-black sm:text-5xl md:text-6xl lg:text-[3.35rem]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                Plugs into your{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #ea580c 0%, #f472b6 50%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  growth stack
                </span>
              </h2>
            </RevealFade>
            <RevealFade delay={0.12} className="mt-5 max-w-md text-base leading-relaxed text-black/55 md:text-[17px]">
              <p>
                Gmail, LinkedIn, HubSpot, Slack, and more — KroniQ connects where your pipeline already
                lives. No rip-and-replace.
              </p>
            </RevealFade>
            <RevealFade delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
              <LiquidMetalButton label="Join Waitlist" type="button" onClick={scrollToWaitlist} />
              <a href="#product" className={glassLight.buttonGhost}>
                See how it works →
              </a>
            </RevealFade>
          </div>

          <RevealSlide from="right" delay={0.1}>
            <RevealStagger className="relative z-10 grid grid-cols-4 justify-items-center gap-2 sm:gap-2.5">
              {INTEGRATIONS.map((item) => (
                <GlowIcon key={item.label} Icon={item.Icon} label={item.label} color={item.color} glow={item.glow} />
              ))}
            </RevealStagger>
          </RevealSlide>
        </div>
      </div>
    </section>
  );
}
