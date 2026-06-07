"use client";

/**
 * Route-transition wrapper for the authed app. Next gives `template.tsx` a fresh key on
 * every navigation, so this replays a quick fade/slide as you move between pages.
 * Kept subtle (and opacity-only under reduced motion) so it never feels sluggish, and
 * auto-height so it doesn't interfere with the scroll container in <main>.
 */
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function AppTemplate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
