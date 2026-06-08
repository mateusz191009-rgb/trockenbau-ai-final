"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, X } from "lucide-react";
import { navSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  /** Whether the mobile drawer is open. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white",
          "transition-transform duration-300 ease-in-out lg:translate-x-0",
          "dark:border-slate-800 dark:bg-slate-900",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Trockenbau AI
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Contractor Platform
              </span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.enabled ? item.href : "#"}
                        onClick={(e) => {
                          if (!item.enabled) e.preventDefault();
                          else onClose();
                        }}
                        aria-disabled={!item.enabled}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                          !item.enabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            active
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200",
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              active
                                ? "bg-brand-500 text-white"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Upgrade / AI card */}
        <div className="p-3">
          <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 dark:border-brand-500/20 dark:from-brand-500/10 dark:to-slate-900">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              AI Estimator Pro
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Unlock automated take-offs and crew planning.
            </p>
            <button className="mt-3 w-full rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
              Upgrade plan
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
