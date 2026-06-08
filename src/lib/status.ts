import type { DateiTyp, ProjektStatus } from "@/types";

interface StatusMeta {
  label: string;
  className: string;
  dot: string;
}

export const projektStatusMeta: Record<ProjektStatus, StatusMeta> = {
  anfrage: {
    label: "Anfrage",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  angebot: {
    label: "Angebot",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  in_arbeit: {
    label: "In Arbeit",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  fertig: {
    label: "Fertig",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

export const projektStatusReihenfolge: ProjektStatus[] = [
  "anfrage",
  "angebot",
  "in_arbeit",
  "fertig",
];

export const dateiTypLabel: Record<DateiTyp, string> = {
  bild: "Bild",
  pdf: "PDF",
  grundriss: "Grundriss",
  sprachnachricht: "Sprachnachricht",
  sonstige: "Datei",
};

/** Erkennt den Dateityp anhand von MIME-Type und Name. */
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
