import type { AngebotStatus, DateiTyp, ProjektStatus } from "@/types";

interface StatusStyle {
  className: string;
  dot: string;
}

export const projektStatusStyles: Record<ProjektStatus, StatusStyle> = {
  anfrage: {
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  angebot: {
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  in_arbeit: {
    className: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  fertig: {
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

/** @deprecated Use projektStatusStyles + useStatusLabels */
export const projektStatusMeta = projektStatusStyles;

export const projektStatusReihenfolge: ProjektStatus[] = [
  "anfrage",
  "angebot",
  "in_arbeit",
  "fertig",
];

export const angebotStatusStyles: Record<AngebotStatus, StatusStyle> = {
  entwurf: {
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  versendet: {
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  angenommen: {
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  abgelehnt: {
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    dot: "bg-red-500",
  },
};

export const angebotStatusReihenfolge: AngebotStatus[] = [
  "entwurf",
  "versendet",
  "angenommen",
  "abgelehnt",
];

/** @deprecated Use useStatusLabels */
export const dateiTypLabel: Record<DateiTyp, string> = {
  bild: "Bild",
  pdf: "PDF",
  grundriss: "Grundriss",
  sprachnachricht: "Sprachnachricht",
  sonstige: "Datei",
};

export function erkenneDateiTyp(mimeType: string, name: string): DateiTyp {
  const n = name.toLowerCase();
  if (mimeType.startsWith("audio/")) return "sprachnachricht";
  if (mimeType.startsWith("image/")) {
    if (n.includes("grundriss") || n.includes("plan")) return "grundriss";
    return "bild";
  }
  if (mimeType === "application/pdf") {
    if (n.includes("grundriss") || n.includes("plan")) return "grundriss";
    return "pdf";
  }
  return "sonstige";
}
