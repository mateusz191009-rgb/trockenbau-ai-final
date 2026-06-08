import {
  FileText,
  HardHat,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const typeMeta: Record<
  ActivityItem["type"],
  { icon: LucideIcon; className: string }
> = {
  project: {
    icon: HardHat,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  customer: {
    icon: UserPlus,
    className:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  invoice: {
    icon: FileText,
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  ai: {
    icon: Sparkles,
    className:
      "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <ul className="space-y-1">
          {items.map((item, i) => {
            const meta = typeMeta[item.type];
            const Icon = meta.icon;
            const isLast = i === items.length - 1;
            return (
              <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast ? (
                  <span className="absolute left-[18px] top-9 h-full w-px bg-slate-100 dark:bg-slate-800" />
                ) : null}
                <span
                  className={cn(
                    "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    meta.className,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="pt-0.5">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.actor}
                    </span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-brand-600 dark:text-brand-400">
                      {item.target}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
