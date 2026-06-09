import { useTranslations } from "next-intl";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function DatenschutzPage() {
  const t = useTranslations("legal.privacy");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingNavbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          {t("content")}
        </p>
      </main>
      <LandingFooter />
    </div>
  );
}
