"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Users, HardHat, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatKachel } from "@/components/dashboard/StatKachel";
import { LetzteAktivitaeten } from "@/components/dashboard/LetzteAktivitaeten";
import { ProjektKarte } from "@/components/projekte/ProjektKarte";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { kunden, projekte, aktivitaeten, firmendaten } = useData();

  const letzteProjekte = [...projekte]
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm))
    .slice(0, 4);

  const begruessung = firmendaten.firmenname
    ? t("welcomeCompany", { company: firmendaten.firmenname })
    : t("welcome");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={begruessung} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatKachel
          label={t("stats.customers")}
          wert={kunden.length}
          icon={Users}
          href="/kunden"
        />
        <StatKachel
          label={t("stats.projects")}
          wert={projekte.length}
          icon={HardHat}
          href="/projekte"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("recentProjects")}</CardTitle>
              <Link
                href="/projekte"
                className="inline-flex items-center gap-1 text-base font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                {t("viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {letzteProjekte.length === 0 ? (
                <EmptyState
                  icon={HardHat}
                  title={t("noProjects")}
                  description={t("noProjectsDesc")}
                  action={
                    <Link href="/projekte">
                      <Button size="lg">{t("toProjects")}</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {letzteProjekte.map((p) => (
                    <ProjektKarte key={p.id} projekt={p} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <LetzteAktivitaeten items={aktivitaeten} />
      </div>
    </div>
  );
}
