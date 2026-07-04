/**
 * Pure ASCII-safe referral code normalization (client + server).
 * Must not import Node-only modules.
 *
 * Referral codes in the DB are [A-Z2-9] only. URLs or copy/paste can introduce
 * Unicode lookalikes (e.g. Ø vs O). Stripping "non A-Z" used to remove Ø and
 * break lookups (e.g. VØYDFND1 → VYDFND1 ≠ VOYDFND1).
 */
export function normalizeReferralCode(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  let t = raw.trim().toUpperCase();
  // Fold common Latin / Nordic letters to ASCII before stripping non-alphanumeric
  t = t.replace(/\u00D8/g, "O"); // Ø
  t = t.replace(/\u00F8/g, "O"); // ø (if any slipped through)
  t = t.replace(/\u0141/g, "L"); // Ł
  t = t.replace(/\u0142/g, "L"); // ł
  t = t.replace(/[^A-Z0-9]/g, "");
  return t.length > 0 ? t : null;
}
