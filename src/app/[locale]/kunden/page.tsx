"use client";

import * as React from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchField } from "@/components/ui/SearchField";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { KundeForm } from "@/components/kunden/KundeForm";
import { KundeKarte } from "@/components/kunden/KundeKarte";
import { useData } from "@/store/DataContext";
import type { Kunde } from "@/types";

export default function KundenPage() {
  const { kunden, kundeLoeschen } = useData();
  const [suche, setSuche] = React.useState("");
  const [formOffen, setFormOffen] = React.useState(false);
  const [bearbeiten, setBearbeiten] = React.useState<Kunde | null>(null);
  const [loeschen, setLoeschen] = React.useState<Kunde | null>(null);

  const gefiltert = React.useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return kunden;
    return kunden.filter((k) =>
      [k.firmenname, k.ansprechpartner, k.email, k.telefon, k.adresse]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [kunden, suche]);

  const neu = () => {
    setBearbeiten(null);
    setFormOffen(true);
  };

  const oeffnenBearbeiten = (kunde: Kunde) => {
    setBearbeiten(kunde);
    setFormOffen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kunden"
        description="Alle Ihre Auftraggeber an einem Ort."
        actions={
          <Button size="lg" onClick={neu}>
            <Plus className="h-6 w-6" />
            Kunde anlegen
          </Button>
        }
      />

      <div className="max-w-xl">
        <SearchField
          value={suche}
          onChange={setSuche}
          placeholder="Kunde suchen…"
        />
      </div>

      {gefiltert.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={
              kunden.length === 0
                ? "Noch keine Kunden"
                : "Keine Treffer"
            }
            description={
              kunden.length === 0
                ? "Legen Sie Ihren ersten Kunden an, um loszulegen."
                : "Versuchen Sie einen anderen Suchbegriff."
            }
            action={
              kunden.length === 0 ? (
                <Button size="lg" onClick={neu}>
                  <Plus className="h-6 w-6" />
                  Kunde anlegen
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gefiltert.map((kunde) => (
            <KundeKarte
              key={kunde.id}
              kunde={kunde}
              onBearbeiten={oeffnenBearbeiten}
              onLoeschen={setLoeschen}
            />
          ))}
        </div>
      )}

      <KundeForm
        open={formOffen}
        onClose={() => setFormOffen(false)}
        kunde={bearbeiten}
      />

      <ConfirmDialog
        open={loeschen !== null}
        title="Kunde löschen?"
        message={`„${loeschen?.firmenname}“ und alle zugehörigen Projekte und Dateien werden gelöscht. Das kann nicht rückgängig gemacht werden.`}
        onCancel={() => setLoeschen(null)}
        onConfirm={() => {
          if (loeschen) kundeLoeschen(loeschen.id);
          setLoeschen(null);
        }}
      />
    </div>
  );
}
