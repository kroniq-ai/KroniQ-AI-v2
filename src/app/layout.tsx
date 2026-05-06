import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import CustomCursor from "@/components/CustomCursor";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import Vignette, { VignetteProvider } from "@/components/Vignette";
import WaitlistModal from "@/components/WaitlistModal";
import WaitlistExtraDetailsModal from "@/components/WaitlistExtraDetailsModal";
import WaitlistUrlEffects from "@/components/WaitlistUrlEffects";
import LeaderboardModalHost from "@/components/LeaderboardModalHost";
import WaitlistTopBar from "@/components/WaitlistTopBar";
import LandingProgressiveBlur from "@/components/home/LandingProgressiveBlur";
import { kroniqAppIconPath } from "@/lib/brand/kroniq-assets";
import { buildRootJsonLd } from "@/lib/seo/json-ld";
import { defaultDescription, getSiteUrl, openGraphImage, siteName, siteTagline, verificationMetadata } from "@/lib/seo/site";
import { resolvePublicSiteOriginServer } from "@/lib/waitlist/public-site-url";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = resolvePublicSiteOriginServer();
const siteVerification = verificationMetadata();
const canonicalBase = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "KroniQ — Your autonomous AI CMO",
    template: "%s | KroniQ",
  },
  description: defaultDescription,
  keywords: [
    "KroniQ",
    "AI CMO",
    "autonomous growth",
    "autonomous marketing",
    "AI marketing automation",
    "founder marketing",
    "B2B outreach AI",
    "private beta waitlist",
    "multi-agent AI",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "technology",
  openGraph: {
    title: `KroniQ — ${siteTagline}`,
    description: defaultDescription,
    siteName,
    locale: "en_CA",
    type: "website",
    url: canonicalBase,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `KroniQ — ${siteTagline}`,
    description: defaultDescription,
    images: [openGraphImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(siteVerification ? { verification: siteVerification } : {}),
  /** 48×48+ first (Google’s favicon guidance). Root `/favicon.ico` helps crawlers that only fetch the default path. */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: kroniqAppIconPath, sizes: "48x48", type: "image/png" },
      { url: kroniqAppIconPath, sizes: "32x32", type: "image/png" },
      { url: kroniqAppIconPath, sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: kroniqAppIconPath, sizes: "180x180", type: "image/png" },
      { url: kroniqAppIconPath, sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent",
  },
};

import { KroniQNav } from "@/components/ui/kroniq-nav";
import { ThemeProvider } from "@/components/theme-provider";

const rootJsonLd = buildRootJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <VignetteProvider>
            <SmoothScroll>
              <PageTransition>
                {children}
              </PageTransition>
            </SmoothScroll>
            <WaitlistTopBar />
            <LeaderboardModalHost />
            <KroniQNav />
            <WaitlistUrlEffects />
            <WaitlistModal />
            <WaitlistExtraDetailsModal />
          </VignetteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
