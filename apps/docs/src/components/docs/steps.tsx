"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div
      className={cn(
        "my-6 [counter-reset:step] space-y-0",
        "[&>*]:relative [&>*]:border-l-2 [&>*]:border-border [&>*]:pb-8 [&>*]:pl-8",
        "[&>*:last-child]:border-0 [&>*:last-child]:pb-0",
        "[&>*]:before:absolute [&>*]:before:left-[-17px] [&>*]:before:top-0",
        "[&>*]:before:flex [&>*]:before:h-8 [&>*]:before:w-8",
        "[&>*]:before:items-center [&>*]:before:justify-center",
        "[&>*]:before:rounded-full [&>*]:before:border [&>*]:before:border-border",
        "[&>*]:before:bg-background [&>*]:before:text-sm [&>*]:before:font-semibold",
        "[&>*]:before:[counter-increment:step] [&>*]:before:[content:counter(step)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StepProps {
  children: React.ReactNode;
  className?: string;
}

export function Step({ children, className }: StepProps) {
  return <div className={cn("", className)}>{children}</div>;
}
