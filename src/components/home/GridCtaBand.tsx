"use client";

import { motion } from "framer-motion";
import { GridAnimation } from "@/components/ui/grid-animation";
import { PilotLoginLink } from "@/components/PilotLoginLink";
import { glassDark } from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

export function GridCtaBand() {
  return (
    <section className="relative flex min-h-[50vh] w-full items-center justify-center overflow-hidden bg-black py-20">
      <div className="absolute inset-0 flex items-center justify-center opacity-80">
        <GridAnimation
          cols={48}
          rows={24}
          spacing={26}
          className="max-h-full max-w-full"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black to-transparent" />

      <motion.div
        className="relative z-10 px-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className={cn(glassDark.pill, "mb-3 text-[10px] tracking-[0.2em] text-emerald-400/90")}>
          Private pilot
        </p>
        <h2
          className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Invited to the pilot?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/45 sm:text-base">
          Sign in on the product app with the credentials we sent you. Everyone else — join the
          waitlist above.
        </p>
        <PilotLoginLink
          nextPath="/context?setup=1"
          className={cn(glassDark.button, "pointer-events-auto mt-8 px-7 py-3.5 text-sm")}
        >
          Sign in to KroniQ app
        </PilotLoginLink>
      </motion.div>
    </section>
  );
}
