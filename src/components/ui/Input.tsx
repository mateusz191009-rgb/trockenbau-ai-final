import * as React from "react";
import { cn } from "@/lib/utils";

const basis =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(basis, "h-[3.25rem]", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(basis, "py-3 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(basis, "h-[3.25rem] cursor-pointer pr-10", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
