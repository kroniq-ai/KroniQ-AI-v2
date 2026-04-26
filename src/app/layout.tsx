import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
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

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const siteUrl = resolvePublicSiteOriginServer();
const siteVerification = verificationMetadata();
const canonicalBase = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#050607",
  colorScheme: "dark",
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
  icons: {
    icon: [
      { url: kroniqAppIconPath, sizes: "32x32", type: "image/png" },
      { url: kroniqAppIconPath, sizes: "48x48", type: "image/png" },
      { url: kroniqAppIconPath, sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      { url: kroniqAppIconPath, sizes: "180x180", type: "image/png" },
      { url: kroniqAppIconPath, sizes: "192x192", type: "image/png" },
    ],
    shortcut: kroniqAppIconPath,
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent",
  },
};

import DockNav from "@/components/DockNav";
import { ThemeProvider } from "@/components/theme-provider";

const rootJsonLd = buildRootJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href={kroniqAppIconPath} type="image/png" sizes="32x32" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <VignetteProvider>
            <CustomCursor />
            <Vignette />
            <SmoothScroll>
              <PageTransition>
                {children}
              </PageTransition>
            </SmoothScroll>
            <WaitlistTopBar />
            <LeaderboardModalHost />
            <DockNav />
            <LandingProgressiveBlur />
            <WaitlistUrlEffects />
            <WaitlistModal />
            <WaitlistExtraDetailsModal />
          </VignetteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
