"use client";

import { BrandMark, Nav } from "@/components/nav";
import { PageTransition } from "@/components/motion/page-transition";
import { UserButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import { Monitor, Moon, Sun, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ToolTheme = "light" | "dark" | "system";
const THEME_KEY = "apex-tool-theme";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ToolTheme>("system");
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") setTheme(stored);
  }, []);

  function updateTheme(next: ToolTheme) {
    setTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
  }

  return (
    <div className="apex-console min-h-screen" data-tool-theme={theme}>
      <aside className="apex-sidebar">
        <div className="space-y-8">
          <BrandMark />
          <Nav />
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="apex-user-button"
            aria-label="Open profile settings"
            onClick={() => {
              if (isSignedIn) {
                clerk.openUserProfile();
              } else {
                clerk.openSignIn();
              }
            }}
          >
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <UserCircle className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Profile</p>
              <p className="text-xs text-muted-foreground">Account and session</p>
            </div>
          </button>
          <ThemeSwitcher theme={theme} onChange={updateTheme} />
        </div>
      </aside>

      <header className="apex-mobilebar">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeSwitcher theme={theme} onChange={updateTheme} compact />
          <UserButton userProfileMode="modal" />
        </div>
      </header>
      <div className="apex-mobile-nav">
        <Nav compact />
      </div>

      <main className="apex-main min-w-0">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

function ThemeSwitcher({
  theme,
  onChange,
  compact = false,
}: {
  theme: ToolTheme;
  onChange: (theme: ToolTheme) => void;
  compact?: boolean;
}) {
  const options: { value: ToolTheme; label: string; icon: React.ReactNode }[] = [
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
  ];

  return (
    <div className="apex-theme-toggle" aria-label="Theme selector">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          title={option.label}
          onClick={() => onChange(option.value)}
          className={theme === option.value ? "is-active" : undefined}
        >
          {option.icon}
          {!compact ? <span>{option.label}</span> : null}
        </button>
      ))}
    </div>
  );
}
