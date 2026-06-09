"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "light" | "dark";
}

export function LanguageSwitcher({
  className,
  variant = "light",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const wechseln = (next: Locale) => {
    router.replace(pathname, { locale: next });
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Sprache wählen"
        aria-expanded={open}
        className={cn(
          "inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-base font-semibold transition-colors",
          variant === "light"
            ? "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            : "text-white/90 hover:bg-white/10",
        )}
      >
        <Globe className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
      </button>

      {open ? (
        <div
          className={cn(
            "absolute end-0 z-50 mt-2 max-h-72 w-48 overflow-y-auto rounded-2xl border py-1 shadow-card",
            "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
          )}
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => wechseln(l)}
              className={cn(
                "flex w-full items-center px-4 py-3 text-start text-base font-medium transition-colors",
                l === locale
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800",
              )}
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
