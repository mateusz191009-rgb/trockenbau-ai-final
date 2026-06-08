import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white focus-visible:ring-slate-400/40",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 focus-visible:ring-slate-400/40",
  ghost:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:ring-slate-400/40",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
