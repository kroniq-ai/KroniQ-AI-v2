import type { Metadata } from "next";
import HomeLanding from "@/components/home/HomeLanding";
import { defaultDescription, openGraphImage, siteName, siteTagline } from "@/lib/seo/site";
import { getPublicWaitlistStats } from "@/lib/waitlist/get-public-waitlist-stats";
import type { WaitlistHeroInitialStats } from "@/lib/waitlist/hero-initial-stats";

const SSR_STATS_BUDGET_MS = 2500;

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

/**
 * Server fetch is bounded so a slow/hung DB does not block RSC (infinite `loading.tsx`).
 * Client `WaitlistHeroSocialProof` still hydrates the count; offset fallback if API is down.
 */
export default async function HomePage() {
  let initialWaitlistStats: WaitlistHeroInitialStats | null = null;
  try {
    initialWaitlistStats = await new Promise<WaitlistHeroInitialStats | null>((resolve) => {
      const t = setTimeout(() => resolve(null), SSR_STATS_BUDGET_MS);
      getPublicWaitlistStats()
        .then((s) => {
          clearTimeout(t);
          resolve({
            configured: s.configured,
            displayCount: s.displayCount,
            showPlus: s.showPlus,
          });
        })
        .catch(() => {
          clearTimeout(t);
          resolve(null);
        });
    });
  } catch {
    initialWaitlistStats = null;
  }
  return <HomeLanding initialWaitlistStats={initialWaitlistStats} />;
}
