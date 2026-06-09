import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export function CtaSection() {
  const t = useTranslations("landing.cta");

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 px-8 py-14 text-center shadow-card sm:px-12">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
          {t("subtitle")}
        </p>
        <Link href="/registrieren" className="mt-8 inline-block">
          <Button
            size="lg"
            variant="secondary"
            className="min-w-[220px] gap-2 bg-white text-brand-700 hover:bg-brand-50"
          >
            {t("button")}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
