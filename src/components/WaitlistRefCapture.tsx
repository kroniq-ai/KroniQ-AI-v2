"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WAITLIST_AUTO_OPEN_MODAL_KEY, WAITLIST_REF_STORAGE_KEY } from "@/lib/waitlist/storage";

/**
 * Persists ?ref= to sessionStorage and removes it from the URL for a clean address bar.
 */
export default function WaitlistRefCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("ref");
    if (!raw) return;

    const normalized = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalized) {
      try {
        sessionStorage.setItem(WAITLIST_REF_STORAGE_KEY, normalized);
        sessionStorage.setItem(WAITLIST_AUTO_OPEN_MODAL_KEY, "1");
      } catch {
        // storage full / disabled
      }
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent("voyd-open-waitlist-modal"));
      });
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    const next = url.pathname + url.search + url.hash;
    window.history.replaceState({}, "", next);
  }, [searchParams]);

  return null;
}
