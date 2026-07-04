/** Routes that use the app shell (no marketing nav / intro). */
const APP_SHELL_PREFIXES = ["/dashboard", "/project", "/login", "/dev-access"] as const;

export function isAppShellRoute(pathname: string) {
  return APP_SHELL_PREFIXES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/");
}

/** Dashboard / project — hide custom cursor, skip marketing chrome. */
export function isPlatformRoute(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/project" ||
    pathname.startsWith("/project/") ||
    pathname === "/dev-access" ||
    pathname.startsWith("/dev-access/")
  );
}
