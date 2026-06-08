import { cn, getInitialen } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white",
        "ring-2 ring-white dark:ring-slate-900",
        "h-10 w-10",
        className,
      )}
      title={name}
    >
      {getInitialen(name)}
    </span>
  );
}
