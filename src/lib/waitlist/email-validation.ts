/**
 * Client + server email checks for waitlist signup (format + obvious throwaways).
 */

const DISPOSABLE_DOMAINS = new Set([
    "mailinator.com",
    "guerrillamail.com",
    "tempmail.com",
    "temp-mail.org",
    "throwaway.email",
    "yopmail.com",
    "10minutemail.com",
    "trashmail.com",
    "fakeinbox.com",
]);

/** Basic RFC-style shape: local@domain.tld, no spaces, sane lengths. */
export function isValidEmailForSignup(email: string): boolean {
    const t = email.trim().toLowerCase();
    if (t.length < 5 || t.length > 254) return false;

    const at = t.indexOf("@");
    if (at < 1) return false;

    const local = t.slice(0, at);
    const domain = t.slice(at + 1);

    if (!local || !domain || !domain.includes(".")) return false;
    if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
    if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false;

    const domainParts = domain.split(".");
    if (domainParts.some((p) => !p || p.length > 63)) return false;

    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) return false;

    return true;
}

export function isDisposableEmailDomain(email: string): boolean {
    const at = email.lastIndexOf("@");
    if (at < 0) return false;
    const domain = email.slice(at + 1).trim().toLowerCase();
    return DISPOSABLE_DOMAINS.has(domain);
}
