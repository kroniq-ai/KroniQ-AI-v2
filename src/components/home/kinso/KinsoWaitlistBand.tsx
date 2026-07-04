"use client";

function openWaitlist() {
  window.dispatchEvent(new CustomEvent("voyd-open-waitlist-modal"));
}
type Props = {
  variant?: "light" | "dark";
};

/** Kinso-style centered waitlist CTA band */
export function KinsoWaitlistBand({ variant = "dark" }: Props) {
  const isLight = variant === "light";

  return (
    <section
      className={
        isLight
          ? "border-y border-black/[0.06] bg-[#fafafa] py-16 md:py-20"
          : "border-y border-white/[0.06] bg-black py-16 md:py-20"
      }
    >
      <div className="section-container mx-auto flex max-w-xl flex-col items-center px-6 text-center">
        <button
          type="button"
          onClick={openWaitlist}
          className={
            isLight
              ? "inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-black/90"
              : "inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
          }
        >
          Join waitlist
          <span aria-hidden>→</span>
        </button>
        <p className={`mt-4 text-[13px] ${isLight ? "text-black/40" : "text-white/35"}`}>
          Private beta · Spots allocated by use-case fit
        </p>
      </div>
    </section>
  );
}
