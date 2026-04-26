"use client";

import { Suspense } from "react";
import PublicSiteConfigLoader from "@/components/PublicSiteConfigLoader";
import WaitlistRefCapture from "@/components/WaitlistRefCapture";
/**
 * Single Suspense boundary for all `useSearchParams` waitlist URL effects.
 * Avoids stacked boundaries that can confuse the dev RSC manifest when `.next` is flaky.
 */
export default function WaitlistUrlEffects() {
  return (
    <Suspense fallback={null}>
      <PublicSiteConfigLoader />
      <WaitlistRefCapture />
    </Suspense>
  );
}
