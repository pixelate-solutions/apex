"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const viewport = { once: false, amount: 0.16, margin: "0px 0px -70px" } as const;
const ease = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

type RevealSectionProps = HTMLMotionProps<"section"> & {
  delay?: number;
};

export function Reveal({ className, delay = 0, initial, whileInView, transition, ...props }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={initial ?? { opacity: 0, y: prefersReducedMotion ? 0 : 22, scale: prefersReducedMotion ? 1 : 0.985 }}
      whileInView={whileInView ?? { opacity: 1, y: 0, scale: 1 }}
      viewport={viewport}
      transition={transition ?? { duration: 0.52, delay, ease }}
      className={cn("will-change-transform", className)}
      {...props}
    />
  );
}

export function RevealSection({ className, delay = 0, initial, whileInView, transition, ...props }: RevealSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={initial ?? { opacity: 0, y: prefersReducedMotion ? 0 : 28 }}
      whileInView={whileInView ?? { opacity: 1, y: 0 }}
      viewport={viewport}
      transition={transition ?? { duration: 0.6, delay, ease }}
      className={cn("will-change-transform", className)}
      {...props}
    />
  );
}
