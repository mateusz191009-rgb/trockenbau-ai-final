"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: SearchFieldProps) {
  const t = useTranslations("common");

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("search")}
        className="h-[3.25rem] w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-11 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          aria-label={t("clearSearch")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
