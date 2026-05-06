import { BrandMark, Nav } from "@/components/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3">
          <BrandMark />
          <Nav compact />
        </div>
      </header>
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r bg-background/96 px-5 py-6 backdrop-blur lg:block">
          <BrandMark />
          <div className="mt-8">
            <Nav />
          </div>
          <div className="absolute bottom-6 left-5 right-5 rounded-3xl border bg-card p-4 text-sm text-muted-foreground bubbly-surface">
            <p className="font-semibold text-foreground">Hybrid persistence</p>
            <p className="mt-1">Local analysis remains available while server adapters handle accounts, objects, and shot records.</p>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:ml-[280px] lg:px-8">{children}</main>
      </div>
    </div>
  );
}
