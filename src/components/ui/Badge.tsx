import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  dot?: string;
}

export function Badge({ className, dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dot)} /> : null}
      {children}
    </span>
  );
}
