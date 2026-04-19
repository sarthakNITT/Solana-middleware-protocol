import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">
        This page could not be found.
      </p>
      <Link
        href="/docs"
        className={cn(buttonVariants({ variant: "default" }))}
      >
        Go to Docs
      </Link>
    </div>
  );
}
