"use client";

/**
 * Small, reusable Framer Motion primitives shared across pages.
 * All respect `prefers-reduced-motion` — when set, they render a plain element
 * with no animation (and crucially no lingering opacity:0 state).
 */
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + slide up when the element scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const containerV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const itemV: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };

/** Wrap a group whose direct {@link StaggerItem} children should cascade in. */
export function Stagger({
  children,
  className,
  amount = 0.15,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={containerV} initial="hidden" whileInView="show" viewport={{ once, amount }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div className={className} style={style} variants={itemV}>
      {children}
    </motion.div>
  );
}
