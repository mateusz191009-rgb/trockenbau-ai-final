"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Sparkles, Loader2, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AngebotStatusBadge } from "@/components/angebote/AngebotStatusBadge";
import { useData } from "@/store/DataContext";
import { berechneSummen, formatEuro } from "@/lib/angebot";
import { formatDatumKurz } from "@/lib/utils";

export function ProjektAngebote({ projektId }: { projektId: string }) {
  const t = useTranslations("angebote");
  const router = useRouter();
  const { getAngeboteVonProjekt, angebotErstellenKi } = useData();
  const angebote = getAngeboteVonProjekt(projektId);

  const [laedt, setLaedt] = React.useState(false);
  const [fehler, setFehler] = React.useState<string | null>(null);

  const erstellen = async () => {
    setLaedt(true);
    setFehler(null);
    try {
      const angebot = await angebotErstellenKi(projektId);
      router.push(`/angebote/${angebot.id}`);
    } catch (err) {
      console.error(err);
      setFehler(err instanceof Error ? err.message : t("generateError"));
    } finally {
      setLaedt(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button size="lg" onClick={erstellen} disabled={laedt} className="w-full sm:w-auto">
        {laedt ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {laedt ? t("generating") : t("generateButton")}
      </Button>

      {laedt ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("generatingHint")}
        </p>
      ) : null}

      {fehler ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {fehler}
        </p>
      ) : null}

      {angebote.length > 0 ? (
        <ul className="space-y-2">
          {angebote.map((a) => {
            const { brutto } = berechneSummen(a.positionen, a.mwstSatz);
            return (
              <li key={a.id}>
                <Link
                  href={`/angebote/${a.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold text-slate-900 dark:text-white">
                        {a.nummer}
                      </span>
                      <AngebotStatusBadge status={a.status} />
                    </span>
                    <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                      {a.titel || t("untitled")} · {formatDatumKurz(a.erstelltAm)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-bold text-slate-900 dark:text-white">
                      {formatEuro(brutto)}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-base text-slate-500 dark:text-slate-400">
          {t("noneDesc")}
        </p>
      )}
    </div>
  );
}
