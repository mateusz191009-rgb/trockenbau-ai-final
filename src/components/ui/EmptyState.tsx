import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Freundlicher Hinweis, wenn noch keine Daten vorhanden sind. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Icon className="h-8 w-8" />
      </span>
      <p className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-base text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
