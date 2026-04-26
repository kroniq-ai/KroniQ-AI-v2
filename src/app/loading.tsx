/**
 * Kept minimal: a full `RouteLoadingView` here + any slow RSC (e.g. await DB) looked
 * like an infinite black loading screen. Prefer a tiny inline indicator; pages should not
 * block the shell on long network I/O.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[100dvh] w-full items-center justify-center bg-background"
      aria-busy
      aria-label="Loading"
    >
      <div className="h-2 w-2 animate-ping rounded-full bg-white/30" />
    </div>
  );
}
