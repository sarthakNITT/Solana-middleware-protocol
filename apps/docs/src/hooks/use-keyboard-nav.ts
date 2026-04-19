"use client";

import * as React from "react";

/**
 * Enables keyboard navigation within the sidebar.
 * Arrow keys move focus between nav links.
 * Home/End jump to first/last item.
 */
export function useKeyboardNav(containerRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getFocusableItems = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      ).filter((el) => !el.closest("[data-state=closed]"));

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = getFocusableItems();
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[next].focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev].focus();
          break;
        }
        case "Home": {
          e.preventDefault();
          items[0].focus();
          break;
        }
        case "End": {
          e.preventDefault();
          items[items.length - 1].focus();
          break;
        }
        default:
          break;
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef]);
}
