"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Layers, Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);

  const links = [
    { href: "#features", label: t("nav.features") },
    { href: "#how-it-works", label: t("nav.howItWorks") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
            <Layers className="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {t("common.appName")}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {t("common.tagline")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-2xl px-4 py-2.5 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Link href="/login">
            <Button variant="ghost" size="md">
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/registrieren">
            <Button size="md">{t("nav.tryFree")}</Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menü"
          className="rounded-2xl p-2.5 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-slate-100 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-200"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-3">
          <LanguageSwitcher />
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="outline" size="lg" className="w-full">
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/registrieren" onClick={() => setOpen(false)}>
            <Button size="lg" className="w-full">
              {t("nav.tryFree")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
