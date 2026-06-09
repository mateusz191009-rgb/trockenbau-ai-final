import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
            <Layers className="h-5 w-5" />
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {t("common.appName")}
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/impressum"
            className="text-base font-semibold text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            {t("footer.impressum")}
          </Link>
          <Link
            href="/datenschutz"
            className="text-base font-semibold text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            {t("footer.privacy")}
          </Link>
          <Link
            href="/kontakt"
            className="text-base font-semibold text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            {t("footer.contact")}
          </Link>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-center text-sm text-slate-500 dark:text-slate-500">
        © {year} {t("common.appName")}. {t("footer.rights")}
      </p>
    </footer>
  );
}
