import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocShell } from "@/components/legal/LegalDocShell";
import { GlassButton } from "@/components/ui/glass-surface";
import { openGraphImage, siteName } from "@/lib/seo/site";

const title = "Contact";
const description = "Get in touch with the KroniQ team — support, waitlist questions, and partnerships.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: "/contact",
    type: "website",
    siteName,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${siteName}`,
    description,
    images: [openGraphImage.url],
  },
};

const SUPPORT_EMAIL = "support@kroniqai.com";

export default function ContactPage() {
  return (
    <LegalDocShell title="Contact us" kicker="Get in touch">
      <p>
        Questions about the waitlist, private beta access, partnerships, or press? We read every message and
        typically reply within one business day.
      </p>

      <div className="not-prose flex flex-wrap gap-3 pt-2">
        <GlassButton href={`mailto:${SUPPORT_EMAIL}`} className="px-6 py-3">
          Email {SUPPORT_EMAIL}
        </GlassButton>
        <GlassButton
          href="https://discord.gg/CbgH53Fnpz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#b8c4ff]"
        >
          Join Discord
        </GlassButton>
      </div>

      <h2>What to include</h2>
      <ul>
        <li>Waitlist or invite questions — the email you signed up with</li>
        <li>Product feedback — what you tried and what you expected</li>
        <li>Partnerships — a short note on your company and goal</li>
      </ul>

      <h2>Other policies</h2>
      <p>
        See our <Link href="/privacy">privacy policy</Link> and <Link href="/terms">terms of service</Link> for
        how we handle data and site use.
      </p>
    </LegalDocShell>
  );
}
