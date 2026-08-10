"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { authService } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthenticated(authService.isAuthenticated());
  }, []);

  const isDark = mounted && theme === "dark";

  function handleThemeToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  function handleLogout() {
    authService.logout();
    setAuthenticated(false);
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href={authenticated ? "/dashboard" : "/"}
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="h-4 w-4" />
            </div>

            <div>
              <div className="font-bold tracking-tight">
                AccordIQ
              </div>

              <p className="text-xs text-muted-foreground">
                Document Intelligence
              </p>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {authenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/analyze">
                  <Button variant="ghost">
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Button>
                </Link>

                <Link href="/register">
                  <Button>
                    Create account
                  </Button>
                </Link>
              </>
            )}
          </nav>

          <Button
            type="button"
            variant="glass"
            size="icon"
            onClick={handleThemeToggle}
            disabled={!mounted}
            aria-label={
              isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            className="shrink-0 rounded-xl"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </Container>
    </header>
  );
}