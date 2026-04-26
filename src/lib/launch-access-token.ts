/**
 * HMAC-SHA256 signing for launch-access cookies (Edge + Node via Web Crypto).
 */

const enc = new TextEncoder();

function utf8ToBase64Url(str: string): string {
  const bytes = enc.encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(b64: string): string {
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const normalized = b64.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export type LaunchTokenPayload = {
  e: string;
  exp: number;
};

export async function signLaunchToken(
  email: string,
  expiresAtMs: number,
  secret: string
): Promise<string> {
  const payload: LaunchTokenPayload = {
    e: email.trim().toLowerCase(),
    exp: expiresAtMs,
  };
  const payloadB64 = utf8ToBase64Url(JSON.stringify(payload));
  const sig = await hmacSha256Hex(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

/** Returns payload if signature and expiry are valid (does not check allowlist). */
export async function verifyLaunchToken(
  token: string,
  secret: string
): Promise<LaunchTokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;
  const expected = await hmacSha256Hex(secret, payloadB64);
  if (!timingSafeEqualHex(sig.toLowerCase(), expected.toLowerCase())) return null;
  try {
    const json = base64UrlToUtf8(payloadB64);
    const p = JSON.parse(json) as LaunchTokenPayload;
    if (!p?.e || typeof p.exp !== "number") return null;
    if (p.exp < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}
