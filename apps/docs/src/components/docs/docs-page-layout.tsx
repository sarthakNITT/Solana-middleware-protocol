import * as React from "react";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { DocsPager } from "@/components/docs/docs-pager";
import { MobileSidebar } from "@/components/docs/mobile-sidebar";
import { docsConfig } from "@/lib/docs-config";
import type { TocEntry } from "@/types/docs";

interface DocsPageLayoutProps {
  children: React.ReactNode;
  toc?: TocEntry[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
  showToc?: boolean;
}

export function DocsPageLayout({
  children,
  toc,
  prev,
  next,
  showToc = true,
}: DocsPageLayoutProps) {
  const hasToc = showToc && toc && toc.length > 0;

  return (
    <div
      className={
        hasToc
          ? "xl:grid xl:grid-cols-[1fr_200px] xl:gap-12"
          : "max-w-[760px] mx-auto"
      }
    >
      <div className="min-w-0 py-6 lg:py-8">
        <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground md:hidden">
          <MobileSidebar items={docsConfig.sidebarNav} />
        </div>

        <div className="docs-content">
          {children}
        </div>

        <DocsPager prev={prev} next={next} />
      </div>

      {hasToc && (
        <div className="hidden xl:block">
          <div className="sticky top-20 pt-8">
            <TableOfContents toc={toc} />
          </div>
        </div>
      )}
    </div>
  );
}
