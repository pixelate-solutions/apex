"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Gauge, Home, Settings, UserRound, Video } from "lucide-react";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/analyze", label: "Analyze", icon: Gauge },
  { href: "/shots", label: "Shots", icon: Video },
  { href: "/account", label: "Account", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-1", compact ? "flex-row overflow-x-auto" : "flex-col")}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            href={item.href}
            key={item.href}
            className={cn(
              "inline-flex cursor-pointer items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              compact && "shrink-0",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BrandMark() {
  return (
    <Link href="/" className="flex cursor-pointer items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <Activity className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-black uppercase leading-none tracking-normal">{PRODUCT_NAME}</span>
        <span className="block text-xs font-medium text-muted-foreground">{PRODUCT_TAGLINE}</span>
      </span>
    </Link>
  );
}
