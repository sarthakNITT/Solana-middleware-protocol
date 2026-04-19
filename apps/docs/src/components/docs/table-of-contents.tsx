"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@/types/docs";

interface TableOfContentsProps {
  toc: TocEntry[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const isAutomaticScroll = React.useRef(false);
  const scrollTimeout = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const headings = document.querySelectorAll(
      ".docs-content h2, .docs-content h3"
    );

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (isAutomaticScroll.current) return;

      const visibleHeadings = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

      if (visibleHeadings.length > 0) {
        setActiveId(visibleHeadings[0].target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-20px 0px -80% 0px",
      threshold: [0, 1],
    });

    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [toc]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    const id = url.replace("#", "");
    setActiveId(id);
    isAutomaticScroll.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isAutomaticScroll.current = false;
    }, 800);
  };

  if (!toc || toc.length === 0) return null;

  return (
    <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
      <div className="space-y-2">
        <p className="font-medium text-sm px-2">On This Page</p>
        <nav className="space-y-1">
          {toc.map((item, idx) => (
            <TocLink
              key={idx}
              item={item}
              activeId={activeId}
              onItemClick={handleClick}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

interface TocLinkProps {
  item: TocEntry;
  activeId: string;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
  depth?: number;
}

function TocLink({ item, activeId, onItemClick, depth = 0 }: TocLinkProps) {
  const id = item.url.replace("#", "");
  const isActive = id === activeId;

  return (
    <div className="space-y-0.5">
      <a
        href={item.url}
        onClick={(e) => onItemClick(e, item.url)}
        className={cn(
          "block py-1 px-2 text-[13px] leading-tight transition-colors duration-200 hover:text-zinc-900 dark:hover:text-zinc-100",
          depth > 0 && "pl-6",
          isActive
            ? "font-medium text-zinc-900 dark:text-zinc-50"
            : "text-zinc-500"
        )}
      >
        {item.title}
      </a>
      {item.items && item.items.length > 0 && (
        <div className="space-y-0.5">
          {item.items.map((subItem, idx) => (
            <TocLink
              key={idx}
              item={subItem}
              activeId={activeId}
              onItemClick={onItemClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
