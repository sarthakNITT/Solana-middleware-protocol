import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface DocsPagerProps {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export function DocsPager({ prev, next }: DocsPagerProps) {
  return (
    <div className="flex flex-row items-center justify-between mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      {prev ? (
        <Link
          href={prev.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "gap-2 px-3 pl-1 text-zinc-500 hover:text-black dark:hover:text-white"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "gap-2 px-3 pr-1 text-zinc-500 hover:text-black dark:hover:text-white"
          )}
        >
          <span>{next.title}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
