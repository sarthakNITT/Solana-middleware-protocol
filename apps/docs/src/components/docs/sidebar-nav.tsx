"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SidebarNavGroup, NavItemWithChildren } from "@/types/docs";

interface SidebarNavProps {
  items: SidebarNavGroup[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-10" role="navigation">
      <div className="w-full space-y-8">
        <div>
           <h4 className="px-3 mb-4 text-[13px] font-medium text-zinc-400 dark:text-zinc-500">
            Sections
          </h4>
          <div className="space-y-6">
            {items.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <h4 className="px-3 py-1 text-[12px] font-normal lowercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  {group.title}
                </h4>
                <div className="grid grid-flow-row auto-rows-max text-sm gap-0.5">
                  {group.items.map((item, itemIdx) => (
                    <SidebarItem
                      key={itemIdx}
                      item={item}
                      pathname={pathname}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  item: NavItemWithChildren & { dot?: boolean };
  pathname: string | null;
  depth?: number;
}

function SidebarItem({ item, pathname, depth = 0 }: SidebarItemProps) {
  const isActive = item.href === pathname;
  const hasChildren = item.items && item.items.length > 0;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <div className={cn(
          "px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-widest",
          depth > 0 ? "pl-5" : ""
        )}>
          {item.title}
        </div>
        <div className="grid grid-flow-row auto-rows-max">
          {item.items!.map((sub, subIdx) => (
            <SidebarItem
              key={subIdx}
              item={sub}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!item.href) {
    return (
      <span className={cn(
        "px-3 py-1 text-zinc-400 cursor-not-allowed",
        depth > 0 ? "pl-5" : ""
      )}>
        {item.title}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex w-full items-center rounded-md px-3 py-1.5 text-[14px] transition-all duration-200",
        depth > 0 && "pl-8",
        isActive
          ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      )}
    >
      {item.title}
      {item.dot && (
        <span className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      )}
      {item.label && (
        <span className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {item.label}
        </span>
      )}
    </Link>
  );
}
