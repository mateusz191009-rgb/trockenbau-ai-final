"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_KEYS = ["1", "2", "3", "4"] as const;

export function FaqSection() {
  const t = useTranslations("landing.faq");
  const [offen, setOffen] = React.useState<string | null>("1");

  return (
    <section
      id="faq"
      className="bg-slate-100/80 px-4 py-20 sm:px-6 sm:py-24 dark:bg-slate-900/50"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <HelpCircle className="h-4 w-4" />
            {t("badge")}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {FAQ_KEYS.map((key) => {
            const aktiv = offen === key;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => setOffen(aktiv ? null : key)}
                  aria-expanded={aktiv}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <span className="text-base font-semibold text-slate-900 dark:text-white">
                    {t(`items.${key}.q`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300",
                      aktiv && "rotate-180 text-brand-500",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    aktiv ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-slate-100 px-5 pb-5 pt-4 text-base leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                      {t(`items.${key}.a`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
