import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEV_ACCESS_COOKIE } from "@/lib/app-access";
import { hasValidLaunchAccessCookie } from "@/lib/launch-access";
import { getAppUrl, usesSplitDeploy } from "@/lib/app-url";

const PROTECTED_PATHS = ["/dashboard", "/project"];

function isLoginPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/");
}
function isAuthPath(pathname: string) {
  return isLoginPath(pathname);
}

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isLegacySignupPath(pathname: string) {
  return pathname === "/signup" || pathname.startsWith("/signup/");
}

function isWaitlistMode() {
  return process.env.NEXT_PUBLIC_APP_ACCESS === "waitlist";
}

function hasDevAccessCookie(request: NextRequest) {
  return request.cookies.get(DEV_ACCESS_COOKIE)?.value === "1";
}

function isDevBypass() {
  return process.env.NODE_ENV === "development";
}

/** App APIs that require dev cookie in waitlist mode */
function isAppApiPath(pathname: string) {
  return (
    pathname.startsWith("/api/projects") ||
    pathname.startsWith("/api/jobs")
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isLegacySignupPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Product routes on marketing domain → real app (app.kroniqai.com)
  if (usesSplitDeploy(request.nextUrl.origin)) {
    if (isProtected(pathname)) {
      return NextResponse.redirect(`${getAppUrl()}/home`);
    }
  }

  const waitlist = isWaitlistMode();
  const devOk = isDevBypass() || hasDevAccessCookie(request);
  let launchOk = false;
  try {
    launchOk = await hasValidLaunchAccessCookie(request);
  } catch {
    launchOk = false;
  }

  if (waitlist && !devOk && !launchOk) {
    if (isAuthPath(pathname) || isProtected(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (
      pathname.startsWith("/api/") &&
      !pathname.startsWith("/api/auth") &&
      pathname !== "/api/dev-access" &&
      isAppApiPath(pathname)
    ) {
      return NextResponse.json({ error: "App access required" }, { status: 403 });
    }
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  /** Public marketing pages: skip Supabase session — less CPU per request, faster TTFB. */
  const needsUserSession = isProtected(pathname) || isAuthPath(pathname);
  if (!needsUserSession) {
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const allowlistRaw = process.env.DEV_ALLOWED_EMAILS?.trim();
    if (user?.email && allowlistRaw) {
      const allowed = new Set(
        allowlistRaw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
      );
      const email = user.email.toLowerCase();
      if (allowed.size > 0 && !allowed.has(email) && (isProtected(pathname) || isAuthPath(pathname))) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (isProtected(pathname) && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isAuthPath(pathname) && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // Supabase unreachable — pass through
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static, SEO files, and brand assets (less middleware = faster responses).
    "/((?!_next/static|_next/image|favicon|robots\\.txt|sitemap\\.xml|site\\.webmanifest|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest|json|woff2)$).*)",
  ],
};
