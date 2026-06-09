"use client";

import { Link } from "@/i18n/navigation";
import { FileText, User, MapPin, Check, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/store/DataContext";
import { formatDatumKurz } from "@/lib/utils";

export default function AngebotePage() {
  const { projekte, kundenName, projektAktualisieren } = useData();

  const offene = projekte.filter((p) => p.status === "angebot");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Angebote"
        description="Alle Baustellen, für die ein Angebot offen ist."
      />

      {offene.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="Keine offenen Angebote"
            description="Setzen Sie eine Baustelle auf den Status „Angebot“, damit sie hier erscheint."
            action={
              <Link href="/projekte">
                <Button size="lg">Zu den Projekten</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {offene.map((projekt) => (
            <Card key={projekt.id} className="flex flex-col p-5">
              <Link
                href={`/projekte/${projekt.id}`}
                className="text-lg font-bold text-slate-900 hover:underline dark:text-white"
              >
                {projekt.projektname}
              </Link>

              <div className="mt-3 space-y-1.5 text-base text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-400" />
                  {kundenName(projekt.kundeId)}
                </p>
                {projekt.baustellenadresse ? (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <span className="truncate">{projekt.baustellenadresse}</span>
                  </p>
                ) : null}
                {projekt.startdatum ? (
                  <p className="text-sm">
                    Geplanter Start: {formatDatumKurz(projekt.startdatum)}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() =>
                    projektAktualisieren(projekt.id, { status: "in_arbeit" })
                  }
                >
                  <Check className="h-5 w-5" />
                  Auftrag erhalten
                </Button>
                <Link href={`/projekte/${projekt.id}`} className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    Öffnen
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
