"use client";

import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search projects, customers…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <button
          aria-label="Notifications"
          className="relative rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-950" />
        </button>

        <div className="ml-1 flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Anna Becker
            </p>
            <p className="text-xs text-slate-400">Operations Lead</p>
          </div>
          <Avatar name="Anna Becker" />
        </div>
      </div>
    </header>
  );
}
