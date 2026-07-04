import type { CookieOptions } from "@supabase/ssr";

/** Share auth cookies across kroniqai.com + app.kroniqai.com in production. */
export function getSharedAuthCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;

  const explicit = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim();
  if (explicit) return explicit.startsWith(".") ? explicit : `.${explicit}`;

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!site) return ".kroniqai.com";

  try {
    const host = new URL(site).hostname.replace(/^www\./, "");
    if (host === "localhost" || host.endsWith(".vercel.app")) return undefined;
    const parts = host.split(".");
    if (parts.length >= 2) return `.${parts.slice(-2).join(".")}`;
  } catch {
    return ".kroniqai.com";
  }

  return ".kroniqai.com";
}

export function withSharedAuthCookieOptions(options?: CookieOptions): CookieOptions {
  const domain = getSharedAuthCookieDomain();
  if (!domain) return options ?? {};
  return { ...options, domain };
}
