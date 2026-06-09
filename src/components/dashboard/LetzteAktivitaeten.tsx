"use client";

import { useTranslations } from "next-intl";
import {
  HardHat,
  Users,
  FolderUp,
  FileText,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Clock } from "lucide-react";
import { zeitVor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Aktivitaet } from "@/types";

const typMeta: Record<Aktivitaet["typ"], { icon: LucideIcon; className: string }> =
  {
    kunde: {
      icon: Users,
      className:
        "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    },
    projekt: {
      icon: HardHat,
      className:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    },
    datei: {
      icon: FolderUp,
      className:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    angebot: {
      icon: FileText,
      className:
        "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    },
  };

export function LetzteAktivitaeten({ items }: { items: Aktivitaet[] }) {
  const t = useTranslations("dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {items.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={t("noActivity")}
            description={t("noActivityDesc")}
          />
        ) : (
          <ul className="space-y-1">
            {items.slice(0, 6).map((item, i) => {
              const meta = typMeta[item.typ];
              const Icon = meta.icon;
              const isLast = i === Math.min(items.length, 6) - 1;
              return (
                <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast ? (
                    <span className="absolute left-[19px] top-10 h-full w-px bg-slate-100 dark:bg-slate-800" />
                  ) : null}
                  <span
                    className={cn(
                      "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      meta.className,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="pt-1">
                    <p className="text-base text-slate-700 dark:text-slate-200">
                      {item.text}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {zeitVor(item.zeit)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
