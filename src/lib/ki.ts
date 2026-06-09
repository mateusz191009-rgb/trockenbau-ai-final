import type { SupabaseClient } from "@supabase/supabase-js";
import type { Einstellungen } from "@/types";
import { signierteLogoUrl } from "@/lib/storage";

/**
 * KI-Vorbereitung
 * ----------------
 * Diese Datei bereitet die Struktur für künftige KI-Funktionen vor
 * (Material-/Stunden-Schätzung, Preisvorschläge). Es wird hier bewusst
 * noch KEINE KI / kein OpenAI angebunden — nur die Datenaufbereitung.
 *
 * Spätere Features lesen den Kontext über `baueKiKontext()` und prüfen
 * mit den `ki`-Schaltern, welche Aktionen erlaubt sind.
 */

/** Kompakter Kontext, den ein KI-Feature später als Eingabe nutzen kann. */
export interface KiKontext {
  firma: {
    firmenname: string;
    inhaber: string;
    ansprechpartner: string;
    adresse: string;
    telefon: string;
    mobil: string;
    email: string;
    website: string;
    ustId: string;
  };
  logoUrl: string | null;
  kalkulation: {
    stundenlohn: number;
    materialaufschlag: number;
    gewinnmarge: number;
    fahrtkostenProKm: number;
    mindestanfahrt: number;
    entsorgungspauschale: number;
    mehrwertsteuer: number;
  };
  nummern: {
    angebotsPraefix: string;
    rechnungsPraefix: string;
  };
  /** Welche Aktionen die KI laut Nutzer-Einstellung ausführen darf. */
  erlaubt: {
    materialSchaetzen: boolean;
    arbeitsstundenSchaetzen: boolean;
    preiseVorschlagen: boolean;
  };
}

/** Setzt die vollständige Firmenadresse aus den Einzelfeldern zusammen. */
export function firmenadresse(e: Einstellungen): string {
  const { strasse, hausnummer, plz, ort } = e.firma;
  const zeile1 = [strasse, hausnummer].filter(Boolean).join(" ");
  const zeile2 = [plz, ort].filter(Boolean).join(" ");
  return [zeile1, zeile2].filter(Boolean).join(", ");
}

/**
 * Baut den KI-Kontext aus den Einstellungen.
 * Wenn ein Supabase-Client übergeben wird, wird zusätzlich eine signierte
 * Logo-URL erzeugt (z. B. für PDF-Angebote).
 */
export async function baueKiKontext(
  einstellungen: Einstellungen,
  supabase?: SupabaseClient,
): Promise<KiKontext> {
  let logoUrl: string | null = null;
  if (supabase && einstellungen.logoPfad) {
    logoUrl = (await signierteLogoUrl(supabase, einstellungen.logoPfad)) || null;
  }

  return {
    firma: {
      firmenname: einstellungen.firma.firmenname,
      inhaber: einstellungen.firma.inhaber,
      ansprechpartner: einstellungen.firma.ansprechpartner,
      adresse: firmenadresse(einstellungen),
      telefon: einstellungen.firma.telefon,
      mobil: einstellungen.firma.mobil,
      email: einstellungen.firma.email,
      website: einstellungen.firma.website,
      ustId: einstellungen.firma.ustId,
    },
    logoUrl,
    kalkulation: { ...einstellungen.kalkulation },
    nummern: {
      angebotsPraefix: einstellungen.angebot.praefix,
      rechnungsPraefix: einstellungen.rechnung.praefix,
    },
    erlaubt: { ...einstellungen.ki },
  };
}

/**
 * Formatiert eine fortlaufende Nummer als `${praefix}${nummer (3-stellig)}`.
 * Beispiel: formatiereNummer("ANG-2026-", 1) -> "ANG-2026-001"
 */
export function formatiereNummer(praefix: string, nummer: number): string {
  return `${praefix}${String(nummer).padStart(3, "0")}`;
}

/** Vorschau der nächsten Angebotsnummer (ohne Hochzählen). */
export function naechsteAngebotsnummerVorschau(e: Einstellungen): string {
  return formatiereNummer(e.angebot.praefix, e.angebot.aktuelleNummer);
}

/** Vorschau der nächsten Rechnungsnummer (ohne Hochzählen). */
export function naechsteRechnungsnummerVorschau(e: Einstellungen): string {
  return formatiereNummer(e.rechnung.praefix, e.rechnung.aktuelleNummer);
}

/**
 * Holt die nächste Angebotsnummer atomar aus der Datenbank und erhöht den
 * Zähler (DB-Funktion `naechste_angebotsnummer`). Für spätere Features.
 */
export async function naechsteAngebotsnummer(
  supabase: SupabaseClient,
): Promise<string> {
  const { data, error } = await supabase.rpc("naechste_angebotsnummer");
  if (error) throw error;
  return data as string;
}

/**
 * Holt die nächste Rechnungsnummer atomar aus der Datenbank und erhöht den
 * Zähler (DB-Funktion `naechste_rechnungsnummer`). Für spätere Features.
 */
export async function naechsteRechnungsnummer(
  supabase: SupabaseClient,
): Promise<string> {
  const { data, error } = await supabase.rpc("naechste_rechnungsnummer");
  if (error) throw error;
  return data as string;
}
