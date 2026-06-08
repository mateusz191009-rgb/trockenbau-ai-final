import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  dot?: string;
}

export function Badge({ className, dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn("h-2 w-2 rounded-full", dot)} /> : null}
      {children}
    </span>
  );
}
