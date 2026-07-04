"use client";

import { GlassPipeDivider } from "@/components/ui/glass-pipe-divider";

/** Clean dark → light boundary between hero and integrations */
export function HeroLightBridge() {
  return <GlassPipeDivider variant="dark-to-light" className="relative z-10 -mt-px" />;
}
