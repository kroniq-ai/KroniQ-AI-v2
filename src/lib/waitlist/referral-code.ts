import { randomInt } from "crypto";

export { normalizeReferralCode } from "./referral-code-normalize";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(length = 8): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += ALPHABET[randomInt(ALPHABET.length)];
  }
  return s;
}
