"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
import type { Projekt } from "@/types";

export default function ProjektePage() {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const { projekte, kundenName, projektLoeschen } = useData();
  const [suche, setSuche] = React.useState("");
  const [formOffen, setFormOffen] = React.useState(false);
  const [bearbeiten, setBearbeiten] = React.useState<Projekt | null>(null);
  const [loeschen, setLoeschen] = React.useState<Projekt | null>(null);

  const gefiltert = React.useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return projekte;
    return projekte.filter((p) =>
      [p.projektname, p.baustellenadresse, kundenName(p.kundeId)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [projekte, suche, kundenName]);

  const neu = () => {
    setBearbeiten(null);
    setFormOffen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button size="lg" onClick={neu}>
            <Plus className="h-6 w-6" />
            {t("add")}
          </Button>
        }
      />

      <div className="max-w-xl">
        <SearchField value={suche} onChange={setSuche} placeholder={t("search")} />
      </div>

      {gefiltert.length === 0 ? (
        <Card>
          <EmptyState
            icon={HardHat}
            title={projekte.length === 0 ? t("empty") : tc("noResults")}
            description={
              projekte.length === 0 ? t("emptyDesc") : t("noResultsDesc")
            }
            action={
              projekte.length === 0 ? (
                <Button size="lg" onClick={neu}>
                  <Plus className="h-6 w-6" />
                  {t("add")}
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
        title={t("deleteTitle")}
        message={t("deleteMessage", { name: loeschen?.projektname ?? "" })}
        onCancel={() => setLoeschen(null)}
        onConfirm={() => {
          if (loeschen) projektLoeschen(loeschen.id);
          setLoeschen(null);
        }}
      />
    </div>
  );
}
