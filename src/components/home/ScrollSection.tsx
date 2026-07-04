"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Stagger delay for nested animations (seconds) */
  delay?: number;
};

/**
 * Consistent scroll-reveal for landing sections (null0-style).
 * Respects prefers-reduced-motion.
 */
const ScrollSection = forwardRef<HTMLElement, Props>(function ScrollSection(
  { children, className = "", id, delay = 0 },
  ref
) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px", amount: 0.15 }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.section>
  );
});

export default ScrollSection;
