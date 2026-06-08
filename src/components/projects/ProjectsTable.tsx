import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { projectStatusMeta } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectsTableProps {
  projects: Project[];
  /** Hide some columns for the compact dashboard variant. */
  compact?: boolean;
}

export function ProjectsTable({ projects, compact = false }: ProjectsTableProps) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            <th className="px-5 py-3 font-semibold">Project</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Progress</th>
            {!compact && (
              <th className="px-5 py-3 font-semibold">Budget</th>
            )}
            {!compact && <th className="px-5 py-3 font-semibold">Due</th>}
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {projects.map((project) => {
            const status = projectStatusMeta[project.status];
            return (
              <tr
                key={project.id}
                className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {project.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {project.id} · {project.customer}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Badge className={status.className} dot={status.dot}>
                    {status.label}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <ProgressBar value={project.progress} className="w-24" />
                    <span className="w-9 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {project.progress}%
                    </span>
                  </div>
                </td>
                {!compact && (
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(project.budget)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatCurrency(project.spent)} spent
                    </div>
                  </td>
                )}
                {!compact && (
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                    {formatDate(project.dueDate)}
                  </td>
                )}
                <td className="px-5 py-4 text-right">
                  <button
                    aria-label="Project actions"
                    className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-slate-800"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
