"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileText, ChevronRight, HardHat } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/SearchField";
import { EmptyState } from "@/components/ui/EmptyState";
import { AngebotStatusBadge } from "@/components/angebote/AngebotStatusBadge";
import { useData } from "@/store/DataContext";
import { berechneSummen, formatEuro } from "@/lib/angebot";
import { formatDatumKurz } from "@/lib/utils";

export default function AngebotePage() {
  const t = useTranslations("angebote");
  const tc = useTranslations("common");
  const { angebote, projekte, kundenName } = useData();
  const [suche, setSuche] = React.useState("");

  const projektName = (id: string) =>
    projekte.find((p) => p.id === id)?.projektname ?? tc("project");

  const gefiltert = React.useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return angebote;
    return angebote.filter((a) =>
      [a.nummer, a.titel, projektName(a.projektId), kundenName(a.kundeId)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angebote, suche, projekte]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("listTitle")} description={t("listDescription")} />

      {angebote.length > 0 ? (
        <div className="max-w-xl">
          <SearchField
            value={suche}
            onChange={setSuche}
            placeholder={t("searchPlaceholder")}
          />
        </div>
      ) : null}

      {gefiltert.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title={angebote.length === 0 ? t("listEmpty") : tc("noResults")}
            description={
              angebote.length === 0 ? t("listEmptyDesc") : t("noResultsDesc")
            }
            action={
              angebote.length === 0 ? (
                <Link href="/projekte">
                  <Button size="lg">
                    <HardHat className="h-5 w-5" />
                    {t("toProjects")}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {gefiltert.map((a) => {
            const { brutto } = berechneSummen(a.positionen, a.mwstSatz);
            return (
              <li key={a.id}>
                <Link
                  href={`/angebote/${a.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold text-slate-900 dark:text-white">
                        {a.nummer}
                      </span>
                      <AngebotStatusBadge status={a.status} />
                    </div>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {a.titel || t("untitled")} · {projektName(a.projektId)} ·{" "}
                      {formatDatumKurz(a.erstelltAm)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-lg font-bold text-slate-900 dark:text-white">
                      {formatEuro(brutto)}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
