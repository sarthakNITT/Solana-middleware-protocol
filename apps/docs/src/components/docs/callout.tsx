import * as React from "react";
import { AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutVariant = "default" | "warning" | "danger" | "success";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const InfoIcon = Info as any;
const AlertTriangleIcon = AlertTriangle as any;
const XCircleIcon = XCircle as any;
const CheckCircleIcon = CheckCircle as any;

const variantConfig: Record<
  CalloutVariant,
  { icon: React.ReactNode; classes: string }
> = {
  default: {
    icon: <InfoIcon className="h-4 w-4 mt-0.5 shrink-0" />,
    classes:
      "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
  },
  warning: {
    icon: <AlertTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" />,
    classes:
      "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
  },
  danger: {
    icon: <XCircleIcon className="h-4 w-4 mt-0.5 shrink-0" />,
    classes:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
  },
  success: {
    icon: <CheckCircleIcon className="h-4 w-4 mt-0.5 shrink-0" />,
    classes:
      "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100",
  },
};

export function Callout({
  variant = "default",
  title,
  children,
  className,
}: CalloutProps) {
  const { icon, classes } = variantConfig[variant];

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4 text-sm",
        classes,
        className
      )}
    >
      {icon}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="leading-relaxed [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}
