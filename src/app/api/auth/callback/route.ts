import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { withSharedAuthCookieOptions } from "@/lib/supabase/cookie-domain";

/**
 * Exchanges Supabase PKCE `code` from magic-link / OAuth redirects and sets session cookies
 * on the response. Using response.cookies (not only cookies()) fixes sessions not sticking in App Router.
 */
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const nextRaw = url.searchParams.get("next") ?? "/";
    const next = nextRaw.startsWith("/") ? nextRaw : `/${nextRaw}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) {
        return NextResponse.redirect(new URL("/login?error=config", url.origin));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=auth", url.origin));
    }

    const redirectTo = new URL(next, url.origin);
    const response = NextResponse.redirect(redirectTo);

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, withSharedAuthCookieOptions(options));
                });
            },
        },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error("[auth/callback] exchangeCodeForSession", error.message);
        return NextResponse.redirect(new URL("/login?error=auth", url.origin));
    }

    return response;
}
