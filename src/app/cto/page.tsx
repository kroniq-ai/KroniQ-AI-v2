import type { Metadata } from "next";
import CTOPageClient from "@/components/cto/CTOPageClient";
import { openGraphImage, siteName } from "@/lib/seo/site";

const title = "KroniQ CTO";
const description =
  "AI agents that architect, build, deploy, and secure your product. A full-stack AI tech partner, not a single dev tool.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cto" },
  openGraph: {
    title: `CTO | ${siteName}`,
    description,
    url: "/cto",
    type: "website",
    siteName,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `CTO | ${siteName}`,
    description,
    images: [openGraphImage.url],
  },
};

export default function CTOPage() {
    return <CTOPageClient />;
}
