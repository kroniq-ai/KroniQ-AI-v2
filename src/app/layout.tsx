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

export const viewport: Viewport = {
    themeColor: "#000000",
    colorScheme: "dark",
};


export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    applicationName: "KroniQ",
    title: {
        default: "KroniQ — Your autonomous AI CMO",
        template: "%s | KroniQ",
    },
    description:
        "KroniQ is your autonomous AI CMO: outreach, content, leads, and follow-up from one mission. Learn your company once — growth runs around the clock. Private beta waitlist.",
    keywords: [
        "KroniQ",
        "AI CMO",
        "autonomous growth",
        "founder marketing",
        "multi-agent AI",
        "LinkedIn outreach",
        "waitlist",
        "private beta",
        "Canada startup",
    ],
    authors: [{ name: "KroniQ", url: siteUrl }],
    creator: "KroniQ",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "KroniQ — Your autonomous AI CMO",
        description:
            "Your autonomous AI CMO for founder-led growth. Private beta — limited seats. Join the waitlist.",
        siteName: "KroniQ",
        locale: "en_CA",
        type: "website",
        url: siteUrl,
    },
    twitter: {
        card: "summary_large_image",
        title: "KroniQ — Your autonomous AI CMO",
        description: "Outreach, content, leads, and follow-up from one mission. Private beta — join the waitlist.",
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
    icons: {
        icon: [
            { url: kroniqAppIconPath, sizes: "32x32", type: "image/png" },
            { url: kroniqAppIconPath, sizes: "192x192", type: "image/png" },
        ],
        apple: [{ url: kroniqAppIconPath, sizes: "180x180", type: "image/png" }],
        shortcut: kroniqAppIconPath,
    },
    manifest: "/site.webmanifest",
    appleWebApp: {
        capable: true,
        title: "KroniQ",
        statusBarStyle: "black-translucent",
    },
};

import DockNav from "@/components/DockNav";
import { ThemeProvider } from "@/components/theme-provider";

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
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "KroniQ",
                            url: siteUrl,
                            logo: `${siteUrl.replace(/\/$/, "")}${kroniqAppIconPath}`,
                            description:
                                "Autonomous AI CMO for founder-led growth — outreach, content, leads, and follow-up from one shared mission context.",
                            parentOrganization: {
                                "@type": "Organization",
                                name: "XYZ Intelligence",
                            },
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "KroniQ",
                            url: siteUrl,
                            description:
                                "Your autonomous AI CMO. Private beta waitlist — mission-driven growth workspace with company memory.",
                            publisher: { "@type": "Organization", name: "KroniQ" },
                            inLanguage: "en-CA",
                        }),
                    }}
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
