import { useTranslations } from "next-intl";
import { ArrowRight, Shield } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 to-white px-4 py-20 sm:px-6 sm:py-28 dark:from-brand-950/30 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-200/30 via-transparent to-transparent dark:from-brand-900/20" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm dark:border-brand-800 dark:bg-slate-900/80 dark:text-brand-400">
          <Shield className="h-4 w-4" />
          {t("trusted")}
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          {t("title")}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
          {t("subtitle")}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/registrieren">
            <Button size="lg" className="min-w-[200px] gap-2">
              {t("cta")}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              {t("login")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
