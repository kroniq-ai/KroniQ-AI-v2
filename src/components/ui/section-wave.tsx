type SectionWaveProps = {
  /** `light` = wave sits on top of a light section (fill is dark band color). `dark` = wave sits on dark section (fill is light). */
  to: "light" | "dark";
};

export function SectionWave({ to }: SectionWaveProps) {
  const fill = to === "light" ? "#0a0a0b" : "#fafafa";
  return (
    <div className="relative z-20 w-full">
      <svg
        className="pointer-events-none absolute top-0 left-0 -mt-px h-16 w-full md:h-24"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M0,64 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,0 L0,0 Z"
          fill={fill}
        />
      </svg>
      <div className={to === "light" ? "h-8 bg-[#fafafa] md:h-12" : "h-8 bg-[#0a0a0b] md:h-12"} />
    </div>
  );
}
