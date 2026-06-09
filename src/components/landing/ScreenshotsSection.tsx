import { useTranslations } from "next-intl";
import { LayoutDashboard, HardHat, FileText } from "lucide-react";

const screenshots = [
  { key: "dashboard", icon: LayoutDashboard, accent: "from-blue-500 to-indigo-600" },
  { key: "projects", icon: HardHat, accent: "from-brand-500 to-orange-600" },
  { key: "offers", icon: FileText, accent: "from-emerald-500 to-teal-600" },
] as const;

export function ScreenshotsSection() {
  const t = useTranslations("landing.screenshots");

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {screenshots.map(({ key, icon: Icon, accent }) => (
            <div key={key} className="group">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ms-2 text-xs font-medium text-slate-400">
                    trockenbau-ai.de
                  </span>
                </div>

                {/* Placeholder UI */}
                <div className={`aspect-[4/3] bg-gradient-to-br ${accent} p-6`}>
                  <div className="flex h-full flex-col rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur dark:bg-slate-900/95">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="h-2 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                      </div>
                    </div>
                    <div className="mt-4 flex-1 space-y-3">
                      <div className="h-8 rounded-xl bg-slate-100 dark:bg-slate-800" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-16 rounded-xl bg-slate-50 dark:bg-slate-800/60" />
                        <div className="h-16 rounded-xl bg-slate-50 dark:bg-slate-800/60" />
                      </div>
                      <div className="h-20 rounded-xl bg-slate-50 dark:bg-slate-800/60" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-base font-semibold text-slate-700 dark:text-slate-300">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
