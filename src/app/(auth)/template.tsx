"use client";

/**
 * Entrance/transition for the auth screens (sign in, sign up, checkout, …). Next gives
 * `template.tsx` a fresh key per navigation, so the card fades + slides up each time you
 * move between auth pages. Opacity-only under reduced motion.
 */
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function AuthTemplate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
