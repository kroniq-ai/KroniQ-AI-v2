import type { Metadata } from "next";
import { openGraphImage, siteName } from "@/lib/seo/site";

const title = "Log in";
const description =
  "Sign in to your KroniQ account with a one-time email code. Access your dashboard and missions after private beta access.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: "/login",
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

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
