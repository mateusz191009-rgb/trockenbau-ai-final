"use client";

import * as React from "react";
import { Plus, HardHat } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchField } from "@/components/ui/SearchField";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProjektForm } from "@/components/projekte/ProjektForm";
import { ProjektKarte } from "@/components/projekte/ProjektKarte";
import { useData } from "@/store/DataContext";
import { projektStatusMeta, projektStatusReihenfolge } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { Projekt, ProjektStatus } from "@/types";

type Filter = "alle" | ProjektStatus;

export default function ProjektePage() {
  const { projekte, kundenName, projektLoeschen } = useData();
  const [suche, setSuche] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("alle");
  const [formOffen, setFormOffen] = React.useState(false);
  const [bearbeiten, setBearbeiten] = React.useState<Projekt | null>(null);
  const [loeschen, setLoeschen] = React.useState<Projekt | null>(null);

  const gefiltert = React.useMemo(() => {
    const q = suche.trim().toLowerCase();
    return projekte.filter((p) => {
      const passtStatus = filter === "alle" || p.status === filter;
      const passtSuche =
        !q ||
        [p.projektname, p.baustellenadresse, kundenName(p.kundeId)]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return passtStatus && passtSuche;
    });
  }, [projekte, filter, suche, kundenName]);

  const neu = () => {
    setBearbeiten(null);
    setFormOffen(true);
  };

  const filterTabs: { value: Filter; label: string }[] = [
    { value: "alle", label: "Alle" },
    ...projektStatusReihenfolge.map((s) => ({
      value: s,
      label: projektStatusMeta[s].label,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projekte"
        description="Ihre Baustellen im Überblick."
        actions={
          <Button size="lg" onClick={neu}>
            <Plus className="h-6 w-6" />
            Neue Baustelle
          </Button>
        }
      />

      <div className="max-w-xl">
        <SearchField
          value={suche}
          onChange={setSuche}
          placeholder="Baustelle suchen…"
        />
      </div>

      {/* Status-Filter */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const aktiv = filter === tab.value;
          const anzahl =
            tab.value === "alle"
              ? projekte.length
              : projekte.filter((p) => p.status === tab.value).length;
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
            icon={HardHat}
            title={
              projekte.length === 0 ? "Noch keine Baustellen" : "Keine Treffer"
            }
            description={
              projekte.length === 0
                ? "Legen Sie Ihre erste Baustelle an."
                : "Andere Suche oder anderen Filter versuchen."
            }
            action={
              projekte.length === 0 ? (
                <Button size="lg" onClick={neu}>
                  <Plus className="h-6 w-6" />
                  Neue Baustelle
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gefiltert.map((projekt) => (
            <ProjektKarte
              key={projekt.id}
              projekt={projekt}
              onBearbeiten={(p) => {
                setBearbeiten(p);
                setFormOffen(true);
              }}
              onLoeschen={setLoeschen}
            />
          ))}
        </div>
      )}

      <ProjektForm
        open={formOffen}
        onClose={() => setFormOffen(false)}
        projekt={bearbeiten}
      />

      <ConfirmDialog
        open={loeschen !== null}
        title="Baustelle löschen?"
        message={`„${loeschen?.projektname}“ und alle zugehörigen Dateien werden gelöscht. Das kann nicht rückgängig gemacht werden.`}
        onCancel={() => setLoeschen(null)}
        onConfirm={() => {
          if (loeschen) projektLoeschen(loeschen.id);
          setLoeschen(null);
        }}
      />
    </div>
  );
}
