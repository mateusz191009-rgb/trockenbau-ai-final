import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 - 100
  className?: string;
  indicatorClassName?: string;
}

export function ProgressBar({
  value,
  className,
  indicatorClassName,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-brand-500 transition-all",
          indicatorClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
