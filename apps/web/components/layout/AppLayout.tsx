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
            Built with precision. Designed to understand. — Sumit Dhara
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            AccordIQ · Document Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}