"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layers, X, LogOut } from "lucide-react";
import { navItems } from "@/lib/navigation";
import { useAuth } from "@/store/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { abmelden } = useAuth();

  const ausloggen = async () => {
    await abmelden();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Hintergrund-Overlay (mobil) */}
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
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
              <Layers className="h-6 w-6" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Trockenbau AI
              </span>
              <span className="text-xs font-medium text-slate-400">
                Einfach. Schnell.
              </span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Menü schließen"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation — große, klare Einträge */}
        <nav className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors",
                  active
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <button
            onClick={ausloggen}
            className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}
