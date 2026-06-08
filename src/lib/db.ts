import type { DatenBestand } from "@/types";
import { seedDaten } from "@/data/seed";

/**
 * Persistenz-Schicht ("Datenbank").
 *
 * Aktuell: localStorage im Browser.
 * Später: Supabase. Dafür müssen nur die Funktionen unten ausgetauscht werden
 * (z. B. `ladeBestand` -> `supabase.from(...).select()`), die restliche App
 * bleibt unverändert, weil alle Zugriffe über den DataContext laufen.
 */

const STORAGE_KEY = "trockenbau-ai:bestand";

export function ladeBestand(): DatenBestand {
  if (typeof window === "undefined") return leererBestand();
  try {
    const roh = window.localStorage.getItem(STORAGE_KEY);
    if (!roh) return seedDaten();
    const daten = JSON.parse(roh) as DatenBestand;
    // Fehlende Felder defensiv auffüllen (z. B. nach Schema-Erweiterung).
    return {
      ...leererBestand(),
      ...daten,
      firmendaten: { ...leererBestand().firmendaten, ...daten.firmendaten },
    };
  } catch {
    return seedDaten();
  }
}

/** Speichert den Bestand. Gibt `false` zurück, wenn der Speicher voll ist. */
export function speichereBestand(bestand: DatenBestand): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bestand));
    return true;
  } catch {
    return false; // QuotaExceeded o. ä.
  }
}

export function loescheBestand(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function leererBestand(): DatenBestand {
  return {
    kunden: [],
    projekte: [],
    dateien: [],
    aktivitaeten: [],
    firmendaten: { firmenname: "", telefon: "", email: "" },
  };
}
