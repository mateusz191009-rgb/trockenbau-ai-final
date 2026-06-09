import { useTranslations } from "next-intl";

const steps = ["1", "2", "3"] as const;

export function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section
      id="how-it-works"
      className="bg-slate-100/80 px-4 py-20 sm:px-6 sm:py-24 dark:bg-slate-900/50"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step} className="relative text-center">
              {i < steps.length - 1 ? (
                <div
                  aria-hidden
                  className="absolute top-8 hidden h-0.5 w-full bg-brand-200 md:block md:start-1/2 md:w-full dark:bg-brand-800"
                />
              ) : null}
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white shadow-md">
                {step}
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {t(`steps.${step}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
