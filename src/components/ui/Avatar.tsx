import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white",
        "ring-2 ring-white dark:ring-slate-900",
        "h-9 w-9",
        className,
      )}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
