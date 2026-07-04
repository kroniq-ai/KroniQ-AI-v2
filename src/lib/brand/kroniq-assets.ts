/** Public paths — add the matching files under `public/logos/`. */
export const kroniqLogoPaths = {
  /** Dark mark on light backgrounds */
  blackNoBg: "/logos/kroniqlogoblackwithoutbg.png",
  /** Light mark on dark backgrounds */
  whiteNoBg: "/logos/kroniqlogowhitewithoutbg.png",
  /** Square / padded mark (favicon, dock, footer badge) */
  withBg: "/logos/kroniqlogowithbg.png",
} as const;

/** PWA, metadata, and JSON-LD `logo` — use the on-brand square asset. */
export const kroniqAppIconPath = kroniqLogoPaths.withBg;
