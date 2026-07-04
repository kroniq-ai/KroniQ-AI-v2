"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Viewport intersection threshold */
  amount?: number;
};

function useReveal(amount = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount, margin: "0px 0px -6% 0px" });
  const reduce = useReducedMotion();
  return { ref, inView: reduce || inView, reduce };
}

/** Fade up — body copy, kickers */
export function RevealFade({ children, className, delay = 0, amount = 0.2 }: RevealProps) {
  const { ref, inView } = useReveal(amount);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word blur fade — headings & quotes */
export function RevealSplitText({
  text,
  className,
  as: Tag = "span",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "span" | "h2" | "h3" | "p";
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25, margin: "0px 0px -6% 0px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(5px)" }}
          animate={inView || reduce ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.38, delay: delay + i * 0.028, ease: EASE }}
          className="mr-[0.26em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

/** Slide from side — visuals, icon grids */
export function RevealSlide({
  children,
  className,
  delay = 0,
  from = "right",
}: RevealProps & { from?: "left" | "right" | "bottom" }) {
  const { ref, inView } = useReveal(0.15);
  const x = from === "left" ? -40 : from === "right" ? 40 : 0;
  const y = from === "bottom" ? 36 : 0;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger children — icon tiles, lists */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

export function RevealStagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12, margin: "0px 0px -4% 0px" });
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={cn(className)} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/** Scale fade — cards, mockups */
export function RevealScale({ children, className, delay = 0 }: RevealProps) {
  const { ref, inView } = useReveal(0.18);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
