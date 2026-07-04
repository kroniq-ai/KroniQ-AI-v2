"use client";

import { useEffect, useRef, useState } from "react";
import { GrainGradient, grainGradientPresets } from "@paper-design/shaders-react";

/** Unmounts the hero WebGL grain shader when scrolled out of view. */
export function HeroGrainBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 -z-10">
      {active ? (
        <GrainGradient
          {...grainGradientPresets[0]}
          colors={["hsl(160, 84%, 39%)", "hsl(188, 86%, 53%)", "hsl(255, 71%, 54%)"]}
          style={{ position: "absolute", inset: 0 }}
        />
      ) : null}
    </div>
  );
}
