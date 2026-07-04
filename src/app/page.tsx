import type { Metadata } from "next";
import HomeLanding from "@/components/home/HomeLanding";
import { defaultDescription, openGraphImage, siteName, siteTagline } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `KroniQ — ${siteTagline}`,
  description: defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: `KroniQ — ${siteTagline}`,
    description: defaultDescription,
    type: "website",
    url: "/",
    siteName,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `KroniQ — ${siteTagline}`,
    description: defaultDescription,
    images: [openGraphImage.url],
  },
};

export default function HomePage() {
  return <HomeLanding />;
}
