"use client";

import { fetchWithTimeout } from "@/lib/waitlist/client-fetch";

/** Call after waitlist join with the same email; sets httpOnly launch cookie if email is allowlisted. */
export async function requestLaunchAccess(email: string): Promise<boolean> {
  const res = await fetchWithTimeout("/api/launch-access/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  let data: { ok?: boolean } = {};
  try {
    data = (await res.json()) as { ok?: boolean };
  } catch {
    /* non-JSON body */
  }
  const granted = Boolean(res.ok && data.ok === true);
  if (granted && typeof window !== "undefined") {
    window.dispatchEvent(new Event("voyd-launch-access-change"));
  }
  return granted;
}
