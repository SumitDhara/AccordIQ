import type { ReactNode } from "react";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/70 bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-8 text-center">
          <p className="text-sm font-medium tracking-tight text-foreground">
            Built with precision. Design with simplicity.
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-serif italic">by</span>
            <span className="font-medium tracking-wide text-foreground/70">
              Sumit Dhara
            </span>
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            AccordIQ · Document Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}