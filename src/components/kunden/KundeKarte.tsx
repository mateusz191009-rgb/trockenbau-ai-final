"use client";

import { Phone, Mail, MapPin, Pencil, Trash2, HardHat } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useData } from "@/store/DataContext";
import type { Kunde } from "@/types";

interface KundeKarteProps {
  kunde: Kunde;
  onBearbeiten: (kunde: Kunde) => void;
  onLoeschen: (kunde: Kunde) => void;
}

export function KundeKarte({ kunde, onBearbeiten, onLoeschen }: KundeKarteProps) {
  const { projekte } = useData();
  const anzahlProjekte = projekte.filter((p) => p.kundeId === kunde.id).length;

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <Avatar name={kunde.firmenname} className="h-12 w-12 text-base" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
            {kunde.firmenname}
          </h3>
          {kunde.ansprechpartner ? (
            <p className="truncate text-base text-slate-500 dark:text-slate-400">
              {kunde.ansprechpartner}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-base text-slate-600 dark:text-slate-300">
        {kunde.telefon ? (
          <a
            href={`tel:${kunde.telefon.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 hover:text-brand-600 dark:hover:text-brand-400"
          >
            <Phone className="h-5 w-5 shrink-0 text-slate-400" />
            {kunde.telefon}
          </a>
        ) : null}
        {kunde.email ? (
          <a
            href={`mailto:${kunde.email}`}
            className="flex items-center gap-2.5 hover:text-brand-600 dark:hover:text-brand-400"
          >
            <Mail className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="truncate">{kunde.email}</span>
          </a>
        ) : null}
        {kunde.adresse ? (
          <p className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="truncate">{kunde.adresse}</span>
          </p>
        ) : null}
      </div>

      {kunde.notizen ? (
        <p className="mt-3 line-clamp-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          {kunde.notizen}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="flex items-center gap-1.5 text-sm text-slate-400">
          <HardHat className="h-4 w-4" />
          {anzahlProjekte} {anzahlProjekte === 1 ? "Projekt" : "Projekte"}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onBearbeiten(kunde)}
            aria-label="Bearbeiten"
            className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            onClick={() => onLoeschen(kunde)}
            aria-label="Löschen"
            className="rounded-xl p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
