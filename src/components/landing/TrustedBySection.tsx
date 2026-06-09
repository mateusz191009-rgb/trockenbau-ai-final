import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";

const COMPANIES = [
  "Müller Trockenbau",
  "Knauf Partner Süd",
  "Rigips Profis",
  "BauTeam Berlin",
  "Drywall Express",
  "Handwerk Schmidt",
  "ProWand GmbH",
  "Trocken & Fertig",
  "Wandwerk Hamburg",
  "Meister Putz",
];

export function TrustedBySection() {
  const t = useTranslations("landing.trustedBy");
  const items = [...COMPANIES, ...COMPANIES];

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/40">
      <p className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {t("title")}
      </p>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/40" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-900/40" />

        <div className="flex w-max animate-marquee items-center gap-10 px-4">
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-soft dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <Building2 className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap text-base font-semibold text-slate-700 dark:text-slate-200">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
