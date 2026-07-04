import { createHash } from "crypto";

export function hashClientIp(ip: string): string {
  const salt = process.env.WAITLIST_IP_HASH_SALT || "voyd-waitlist-ip";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
