"use client";

import { useEffect } from "react";
import { setPublicSiteOriginOverride } from "@/lib/waitlist/client-session";

/** Fetches server-authoritative public URL once so referral links never depend on a stale or missing client env. */
export default function PublicSiteConfigLoader() {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/public-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { publicSiteUrl?: string }) => {
        if (!cancelled && typeof d.publicSiteUrl === "string") {
          setPublicSiteOriginOverride(d.publicSiteUrl);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
