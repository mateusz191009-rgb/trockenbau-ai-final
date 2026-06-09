import { useTranslations } from "next-intl";
import {
  Users,
  HardHat,
  Camera,
  Sparkles,
  FileText,
  Receipt,
  Languages,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const featureKeys = [
  { key: "customers", icon: Users },
  { key: "sites", icon: HardHat },
  { key: "photos", icon: Camera },
  { key: "ai", icon: Sparkles },
  { key: "pdf", icon: FileText },
  { key: "invoices", icon: Receipt },
  { key: "multilingual", icon: Languages },
] as const;

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featureKeys.map(({ key, icon: Icon }) => (
            <FeatureCard
              key={key}
              icon={Icon}
              title={t(`items.${key}.title`)}
              description={t(`items.${key}.description`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-card dark:border-slate-800 dark:bg-slate-900">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
