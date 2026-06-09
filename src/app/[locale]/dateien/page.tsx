"use client";

import * as React from "react";
import { FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchField } from "@/components/ui/SearchField";
import { EmptyState } from "@/components/ui/EmptyState";
import { DateiListe } from "@/components/dateien/DateiListe";
import { useData } from "@/store/DataContext";
import { dateiTypLabel } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { DateiTyp } from "@/types";

type Filter = "alle" | DateiTyp;

const filterReihenfolge: DateiTyp[] = [
  "bild",
  "pdf",
  "grundriss",
  "sprachnachricht",
];

export default function DateienPage() {
  const { dateien } = useData();
  const [suche, setSuche] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("alle");

  const gefiltert = React.useMemo(() => {
    const q = suche.trim().toLowerCase();
    return dateien.filter((d) => {
      const passtTyp = filter === "alle" || d.typ === filter;
      const passtSuche = !q || d.name.toLowerCase().includes(q);
      return passtTyp && passtSuche;
    });
  }, [dateien, filter, suche]);

  const tabs: { value: Filter; label: string }[] = [
    { value: "alle", label: "Alle" },
    ...filterReihenfolge.map((t) => ({
      value: t,
      label: dateiTypLabel[t],
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dateien"
        description="Alle hochgeladenen Bilder, PDFs, Grundrisse und Sprachnachrichten."
      />

      <div className="max-w-xl">
        <SearchField
          value={suche}
          onChange={setSuche}
          placeholder="Datei suchen…"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const aktiv = filter === tab.value;
          const anzahl =
            tab.value === "alle"
              ? dateien.length
              : dateien.filter((d) => d.typ === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-base font-semibold transition-colors",
                aktiv
                  ? "bg-brand-500 text-white"
                  : "border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-2 text-sm",
                  aktiv
                    ? "bg-white/25"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                )}
              >
                {anzahl}
              </span>
            </button>
          );
        })}
      </div>

      {gefiltert.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderOpen}
            title={
              dateien.length === 0 ? "Noch keine Dateien" : "Keine Treffer"
            }
            description={
              dateien.length === 0
                ? "Dateien laden Sie direkt in einer Baustelle hoch."
                : "Versuchen Sie einen anderen Suchbegriff oder Filter."
            }
          />
        </Card>
      ) : (
        <DateiListe dateien={gefiltert} zeigeProjekt />
      )}
    </div>
  );
}
