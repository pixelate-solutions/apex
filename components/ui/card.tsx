"use client";

import * as React from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const revealViewport = { once: false, amount: 0.14, margin: "0px 0px -70px" } as const;
const revealEase = [0.22, 1, 0.36, 1] as const;

export function Card({
  className,
  initial,
  whileInView,
  viewport,
  transition,
  whileHover,
  ...props
}: HTMLMotionProps<"div">) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={initial ?? { opacity: 0, y: prefersReducedMotion ? 0 : 18, scale: prefersReducedMotion ? 1 : 0.985 }}
      whileInView={whileInView ?? { opacity: 1, y: 0, scale: 1 }}
      viewport={viewport ?? revealViewport}
      transition={transition ?? { duration: 0.46, ease: revealEase }}
      whileHover={whileHover ?? (prefersReducedMotion ? undefined : { y: -2 })}
      className={cn("rounded-2xl border bg-card text-card-foreground shadow-sm bubbly-surface will-change-transform", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold leading-none tracking-normal", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />;
}
