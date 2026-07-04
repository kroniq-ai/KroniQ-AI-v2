"use client";

import { Suspense } from "react";
import PublicSiteConfigLoader from "@/components/PublicSiteConfigLoader";

/** Public site config only — referral URL capture removed. */
export default function WaitlistUrlEffects() {
  return (
    <Suspense fallback={null}>
      <PublicSiteConfigLoader />
    </Suspense>
  );
}
