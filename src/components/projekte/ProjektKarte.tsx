"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin, User, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useData } from "@/store/DataContext";
import { formatDatumKurz } from "@/lib/utils";
import type { Projekt } from "@/types";

interface ProjektKarteProps {
  projekt: Projekt;
  onBearbeiten?: (projekt: Projekt) => void;
  onLoeschen?: (projekt: Projekt) => void;
}

export function ProjektKarte({
  projekt,
  onBearbeiten,
  onLoeschen,
}: ProjektKarteProps) {
  const t = useTranslations("common");
  const { kundenName } = useData();

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/projekte/${projekt.id}`}
          className="min-w-0 flex-1 hover:underline"
        >
          <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
            {projekt.projektname}
          </h3>
        </Link>
        <StatusBadge status={projekt.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-base text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{kundenName(projekt.kundeId)}</span>
        </p>
        {projekt.baustellenadresse ? (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{projekt.baustellenadresse}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-sm text-slate-400">
          {projekt.startdatum
            ? `${t("start")} ${formatDatumKurz(projekt.startdatum)}`
            : t("noStartDate")}
        </span>

        <div className="flex items-center gap-1">
          {onBearbeiten ? (
            <button
              onClick={() => onBearbeiten(projekt)}
              aria-label={t("edit")}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Pencil className="h-5 w-5" />
            </button>
          ) : null}
          {onLoeschen ? (
            <button
              onClick={() => onLoeschen(projekt)}
              aria-label={t("delete")}
              className="rounded-xl p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          ) : null}
          <Link
            href={`/projekte/${projekt.id}`}
            aria-label={t("open")}
            className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
