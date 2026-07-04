"use client";

import type { ReactNode } from "react";

const KINSO_ACCENT_GRADIENT = "linear-gradient(90deg, #d4a574 0%, #f472b6 40%, #22d3ee 100%)";

export function KinsoAccentWords({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        background: KINSO_ACCENT_GRADIENT,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

export { KINSO_ACCENT_GRADIENT };
