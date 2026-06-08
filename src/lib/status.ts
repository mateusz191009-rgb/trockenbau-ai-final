import type { CustomerType, ProjectStatus } from "@/types";

interface StatusMeta {
  label: string;
  /** Tailwind classes for badge background/text in both light + dark. */
  className: string;
  /** Solid dot color for compact indicators. */
  dot: string;
}

export const projectStatusMeta: Record<ProjectStatus, StatusMeta> = {
  planning: {
    label: "Planning",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  on_hold: {
    label: "On Hold",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

export const customerTypeMeta: Record<CustomerType, StatusMeta> = {
  residential: {
    label: "Residential",
    className:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  commercial: {
    label: "Commercial",
    className:
      "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  industrial: {
    label: "Industrial",
    className:
      "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
    dot: "bg-orange-500",
  },
};
