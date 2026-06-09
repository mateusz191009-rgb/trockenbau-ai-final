"use client";

import { useTranslations } from "next-intl";
import { Layers, Menu } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { useData } from "@/store/DataContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const t = useTranslations();
  const { firmendaten } = useData();
  const name = firmendaten.firmenname || t("sidebar.myBusiness");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:h-20 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label={t("sidebar.openMenu")}
        className="rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-7 w-7" />
      </button>

      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
          <Layers className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {t("common.appName")}
        </span>
      </div>

      <div className="ms-auto flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="flex items-center gap-3 border-s border-slate-200 ps-3 dark:border-slate-800">
          <span className="hidden text-end text-sm font-semibold text-slate-900 dark:text-white sm:block">
            {name}
          </span>
          <Avatar name={name} />
        </div>
      </div>
    </header>
  );
}
