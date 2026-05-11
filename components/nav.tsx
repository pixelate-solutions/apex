"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Gauge, Home, Settings, Video } from "lucide-react";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/analyze", label: "Analyze", icon: Gauge },
  { href: "/shots", label: "Shots", icon: Video },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <nav className={cn("flex gap-1", compact ? "flex-row overflow-x-auto" : "flex-col")}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : compact ? 0 : -10, y: prefersReducedMotion ? 0 : compact ? 8 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
            whileHover={prefersReducedMotion ? undefined : { x: compact ? 0 : 3, y: compact ? -2 : 0 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            className={cn(compact && "shrink-0")}
          >
            <Link
              href={item.href}
              className={cn(
                "inline-flex cursor-pointer items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground apex-nav-link",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

export function BrandMark() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
    >
    <Link href="/dashboard" className="flex cursor-pointer items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm apex-brand-icon">
        <Activity className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-black uppercase leading-none tracking-normal">{PRODUCT_NAME}</span>
        <span className="block text-xs font-medium text-muted-foreground">{PRODUCT_TAGLINE}</span>
      </span>
    </Link>
    </motion.div>
  );
}
