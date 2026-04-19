"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { docsConfig } from "@/lib/docs-config";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/docs/search-dialog";
import { Button } from "@/components/ui/button";

export function DocsHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const progressRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let requestRunning = false;
    let lastIsScrolled = false;

    const handleScroll = () => {
      if (!requestRunning) {
        requestRunning = true;
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

          if (progressRef.current) {
            progressRef.current.style.setProperty("--scroll-progress", `${Math.min(100, Math.max(0, scrollPercent))}%`);
          }

          const currentScrolled = scrollTop > 0;
          if (currentScrolled !== lastIsScrolled) {
            setIsScrolled(currentScrolled);
            lastIsScrolled = currentScrolled;
          }

          requestRunning = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        ref={progressRef}
        className="fixed top-0 left-0 z-[60] h-[2px] bg-white dark:bg-white transition-all duration-75 ease-out pointer-events-none"
        style={{ width: "var(--scroll-progress, 0%)" }}
      />
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
          isScrolled ? "border-zinc-200 dark:border-zinc-800" : "border-transparent"
        )}
      >
        <div className="container flex h-14 max-screen-2xl items-center px-4 md:px-8">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Sendra Logo"
                width={50}
                height={50}
                className="rounded"
              />
              <span className="hidden font-bold sm:inline-block tracking-tighter text-lg">Sendra</span>
            </Link>
            <nav className="flex items-center gap-8 text-sm font-medium">
              {docsConfig.mainNav.filter(item => item.title !== "Github").map((item) =>
                item.href ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "transition-colors hover:text-foreground/80",
                      pathname === item.href ||
                        (item.href !== "/" && pathname?.startsWith(item.href))
                        ? "text-foreground"
                        : "text-zinc-500"
                    )}
                  >
                    {item.title}
                  </Link>
                ) : null
              )}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <SearchDialog />
            </div>
            <nav className="flex items-center gap-1">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://github.com/sendra-protocol"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
