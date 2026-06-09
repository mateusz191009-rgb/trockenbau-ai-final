"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  FileText,
  Image as ImageIcon,
  Map,
  Mic,
  File as FileIcon,
  Download,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useData } from "@/store/DataContext";
import { useStatusLabels } from "@/hooks/useStatusLabels";
import { cn, formatGroesse, formatDatumKurz } from "@/lib/utils";
import type { Datei, DateiTyp } from "@/types";

const iconMap: Record<DateiTyp, LucideIcon> = {
  bild: ImageIcon,
  pdf: FileText,
  grundriss: Map,
  sprachnachricht: Mic,
  sonstige: FileIcon,
};

interface DateiListeProps {
  dateien: Datei[];
  zeigeProjekt?: boolean;
}

export function DateiListe({ dateien, zeigeProjekt = false }: DateiListeProps) {
  const t = useTranslations("files");
  const tc = useTranslations("common");
  const { dateiTypLabel } = useStatusLabels();
  const { dateiLoeschen, projekte } = useData();
  const [loeschId, setLoeschId] = React.useState<string | null>(null);

  const projektName = (projektId: string) =>
    projekte.find((p) => p.id === projektId)?.projektname ?? tc("project");

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dateien.map((datei) => {
          const Icon = iconMap[datei.typ];
          const istBild = datei.typ === "bild" || datei.typ === "grundriss";
          const istAudio = datei.typ === "sprachnachricht";
          return (
            <div
              key={datei.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900"
            >
              {istBild && datei.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={datei.dataUrl}
                  alt={datei.name}
                  className="h-40 w-full bg-slate-100 object-cover dark:bg-slate-800"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                  <Icon className="h-14 w-14 text-slate-300 dark:text-slate-600" />
                </div>
              )}

              <div className="space-y-3 p-4">
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {datei.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {dateiTypLabel(datei.typ)} · {formatGroesse(datei.groesse)}{" "}
                      · {formatDatumKurz(datei.erstelltAm)}
                    </p>
                  </div>
                </div>

                {istAudio ? (
                  <audio controls src={datei.dataUrl} className="w-full" />
                ) : null}

                {zeigeProjekt ? (
                  <Link
                    href={`/projekte/${datei.projektId}`}
                    className="block truncate text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {projektName(datei.projektId)}
                  </Link>
                ) : null}

                <div className="flex gap-2">
                  <a
                    href={datei.dataUrl}
                    download={datei.name}
                    className={cn(
                      "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold",
                      "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
                    )}
                  >
                    <Download className="h-4 w-4" />
                    {tc("open")}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("deleteAria")}
                    className="h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => setLoeschId(datei.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={loeschId !== null}
        title={t("deleteTitle")}
        message={t("deleteMessage")}
        onCancel={() => setLoeschId(null)}
        onConfirm={() => {
          if (loeschId) dateiLoeschen(loeschId);
          setLoeschId(null);
        }}
      />
    </>
  );
}
