import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { PRODUCT_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: "Local-first launch monitor POC for golf ball tracking and launch metrics.",
  applicationName: PRODUCT_NAME,
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#15221d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
