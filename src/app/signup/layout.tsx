import type { Metadata } from "next";
import { openGraphImage, siteName } from "@/lib/seo/site";

const title = "Sign up";
const description =
  "Create your KroniQ account with a one-time email code. Join the private beta waitlist and your growth workspace.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/signup" },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: "/signup",
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

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
