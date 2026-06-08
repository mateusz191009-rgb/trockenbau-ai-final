/**
 * Kleiner className-Helfer — verbindet wahre Werte mit Leerzeichen.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Datum hübsch, z. B. "8. Juni 2026". Leerer/ungültiger Wert -> "—". */
export function formatDatum(datum: string | Date | undefined | null): string {
  if (!datum) return "—";
  const d = typeof datum === "string" ? new Date(datum) : datum;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Kurzes Datum, z. B. "08.06.2026". */
export function formatDatumKurz(datum: string | Date | undefined | null): string {
  if (!datum) return "—";
  const d = typeof datum === "string" ? new Date(datum) : datum;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE").format(d);
}

/** Relative Zeit auf Deutsch, z. B. "vor 2 Stunden". */
export function zeitVor(iso: string): string {
  const d = new Date(iso);
  const diffSek = Math.round((Date.now() - d.getTime()) / 1000);
  if (diffSek < 60) return "gerade eben";
  const min = Math.round(diffSek / 60);
  if (min < 60) return `vor ${min} Min.`;
  const std = Math.round(min / 60);
  if (std < 24) return `vor ${std} Std.`;
  const tage = Math.round(std / 24);
  if (tage === 1) return "gestern";
  if (tage < 7) return `vor ${tage} Tagen`;
  return formatDatumKurz(iso);
}

/** Dateigröße lesbar, z. B. "1,4 MB". */
export function formatGroesse(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Initialen aus einem Namen, z. B. "Michael Wagner" -> "MW". */
export function getInitialen(name: string): string {
  return name
    .split(" ")
    .map((teil) => teil[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
