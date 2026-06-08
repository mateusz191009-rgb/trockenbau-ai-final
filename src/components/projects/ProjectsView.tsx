"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { projects } from "@/data/mock";
import { projectStatusMeta } from "@/lib/status";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

type Filter = "all" | ProjectStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "planning", label: "Planning" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export function ProjectsView() {
  const [active, setActive] = React.useState<Filter>("all");

  const filtered = React.useMemo(
    () =>
      active === "all"
        ? projects
        : projects.filter((p) => p.status === active),
    [active],
  );

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalArea = projects.reduce((s, p) => s + p.area, 0);

  const summary = [
    { label: "Total Projects", value: String(projects.length) },
    {
      label: "In Progress",
      value: String(
        projects.filter((p) => p.status === "in_progress").length,
      ),
    },
    { label: "Pipeline Value", value: formatCurrency(totalBudget) },
    { label: "Total Area", value: `${totalArea.toLocaleString()} m²` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Track and manage every drywall job across your portfolio."
        actions={
          <Button size="md">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
            <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const isActive = active === f.value;
          const count =
            f.value === "all"
              ? projects.length
              : projects.filter((p) => p.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs",
                  isActive
                    ? "bg-white/20"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {filtered.length > 0 ? (
          <ProjectsTable projects={filtered} />
        ) : (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              No {projectStatusMeta[active as ProjectStatus]?.label.toLowerCase()}{" "}
              projects
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try a different filter or create a new project.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
