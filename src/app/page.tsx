"use client";

import Link from "next/link";
import { Users, HardHat, FileText, Hammer, ArrowRight } from "lucide-react";
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
  const { kunden, projekte, aktivitaeten, firmendaten } = useData();

  const offeneAngebote = projekte.filter((p) => p.status === "angebot").length;
  const aktiveBaustellen = projekte.filter(
    (p) => p.status === "in_arbeit",
  ).length;

  const letzteProjekte = [...projekte]
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm))
    .slice(0, 4);

  const begruessung = firmendaten.firmenname
    ? `Willkommen zurück bei ${firmendaten.firmenname}.`
    : "Willkommen zurück.";

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description={begruessung} />

      {/* 4 Kennzahlen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatKachel
          label="Kunden gesamt"
          wert={kunden.length}
          icon={Users}
          href="/kunden"
        />
        <StatKachel
          label="Projekte gesamt"
          wert={projekte.length}
          icon={HardHat}
          href="/projekte"
        />
        <StatKachel
          label="Offene Angebote"
          wert={offeneAngebote}
          icon={FileText}
          href="/angebote"
        />
        <StatKachel
          label="Aktive Baustellen"
          wert={aktiveBaustellen}
          icon={Hammer}
          href="/projekte"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Letzte Projekte */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Letzte Projekte</CardTitle>
              <Link
                href="/projekte"
                className="inline-flex items-center gap-1 text-base font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Alle ansehen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {letzteProjekte.length === 0 ? (
                <EmptyState
                  icon={HardHat}
                  title="Noch keine Projekte"
                  description="Legen Sie Ihre erste Baustelle an."
                  action={
                    <Link href="/projekte">
                      <Button size="lg">Zur Projektübersicht</Button>
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

        {/* Letzte Aktivitäten */}
        <LetzteAktivitaeten items={aktivitaeten} />
      </div>
    </div>
  );
}
