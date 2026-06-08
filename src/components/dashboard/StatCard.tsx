import {
  ArrowDownRight,
  ArrowUpRight,
  HardHat,
  Euro,
  Users,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Stat } from "@/types";

const iconMap: Record<Stat["icon"], LucideIcon> = {
  projects: HardHat,
  revenue: Euro,
  customers: Users,
  area: Ruler,
};

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = iconMap[stat.icon];
  const isUp = stat.trend === "up";
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="animate-fade-in p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold",
            isUp
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {Math.abs(stat.delta)}%
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {stat.value}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {stat.label}
      </p>
    </Card>
  );
}
