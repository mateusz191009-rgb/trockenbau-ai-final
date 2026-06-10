// Zentrale Datentypen der Anwendung.
// Die Struktur ist flach gehalten und bildet die Supabase-Tabellen ab
// (siehe src/lib/database.ts für die Umwandlung Row <-> App-Typ).

export type ProjektStatus = "anfrage" | "angebot" | "in_arbeit" | "fertig";

export type DateiTyp =
  | "bild"
  | "pdf"
  | "grundriss"
  | "sprachnachricht"
  | "sonstige";

export interface Kunde {
  id: string;
  firmenname: string;
  ansprechpartner: string;
  telefon: string;
  email: string;
  adresse: string;
  notizen: string;
  erstelltAm: string; // created_at
}

export interface Massangaben {
  wandflaeche: string;
  deckenflaeche: string;
  raumhoehe: string;
  sonstige: string;
}

export interface Projekt {
  id: string;
  projektname: string;
  kundeId: string; // customer_id
  baustellenadresse: string;
  beschreibung: string;
  status: ProjektStatus;
  startdatum: string;
  enddatum: string;
  masse: Massangaben;
  notizen: string;
  erstelltAm: string; // created_at
}

export interface Datei {
  id: string;
  projektId: string; // project_id
  name: string; // file_name
  typ: DateiTyp; // file_type
  mimeType: string;
  groesse: number; // Bytes
  path: string; // Speicherpfad im Bucket (file_url)
  dataUrl: string; // signierte Anzeige-URL aus dem Storage
  erstelltAm: string;
}

export interface Aktivitaet {
  id: string;
  text: string;
  typ: "kunde" | "projekt" | "datei" | "angebot";
  zeit: string; // ISO
}

// ---------- Angebote (KI-Angebotserstellung) ----------

/** Art einer Angebotsposition – steuert Gruppierung und Icons. */
export type AngebotPositionArt = "material" | "arbeit" | "fahrt" | "sonstige";

/** Eine einzelne, bearbeitbare Zeile im Angebot. */
export interface AngebotPosition {
  id: string;
  art: AngebotPositionArt;
  bezeichnung: string;
  beschreibung: string;
  menge: number;
  einheit: string; // z. B. "m²", "Std.", "Stk.", "pauschal"
  einzelpreis: number; // € netto pro Einheit
}

export type AngebotStatus =
  | "entwurf"
  | "versendet"
  | "angenommen"
  | "abgelehnt";

/** Ein gespeichertes Angebot inkl. KI-Ergebnissen und Positionen. */
export interface Angebot {
  id: string;
  projektId: string;
  kundeId: string;
  nummer: string; // z. B. "ANG-2026-001"
  titel: string;
  status: AngebotStatus;
  zusammenfassung: string; // Projektzusammenfassung (KI)
  leistungsbeschreibung: string; // Leistungsbeschreibung (KI)
  positionen: AngebotPosition[];
  arbeitsstunden: number; // geschätzte Gesamtstunden
  mwstSatz: number; // %
  zahlungsziel: number; // Tage
  gueltigkeit: number; // Tage
  notizen: string;
  erstelltAm: string; // created_at
  aktualisiertAm: string; // updated_at
}

/**
 * Firmendaten – Stammdaten des eigenen Betriebs.
 * (Früher nur firmenname/telefon/email; jetzt vollständig.)
 */
export interface Firmendaten {
  firmenname: string;
  inhaber: string;
  ansprechpartner: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
  mobil: string;
  email: string;
  website: string;
  ustId: string;
}

/** Kalkulations-Grundwerte für spätere Angebots-/Preis-Berechnungen. */
export interface Kalkulation {
  stundenlohn: number; // €
  materialaufschlag: number; // %
  gewinnmarge: number; // %
  fahrtkostenProKm: number; // €
  mindestanfahrt: number; // €
  entsorgungspauschale: number; // €
  mehrwertsteuer: number; // %
}

/** Angebots-Einstellungen inkl. eigener Nummern-Sequenz. */
export interface AngebotEinstellungen {
  praefix: string;
  aktuelleNummer: number;
  zahlungsziel: number; // Tage
  gueltigkeit: number; // Tage
}

/** Rechnungs-Einstellungen inkl. eigener Nummern-Sequenz und Bankdaten. */
export interface RechnungEinstellungen {
  praefix: string;
  aktuelleNummer: number;
  zahlungsziel: number; // Tage
  bankname: string;
  iban: string;
  bic: string;
}

/** KI-Vorbereitung – welche Aufgaben die KI später übernehmen darf. */
export interface KiEinstellungen {
  materialSchaetzen: boolean;
  arbeitsstundenSchaetzen: boolean;
  preiseVorschlagen: boolean;
}

/** Vollständige, pro Nutzer gespeicherte Einstellungen. */
export interface Einstellungen {
  firma: Firmendaten;
  logoPfad: string | null; // Pfad im Storage-Bucket "logos"
  kalkulation: Kalkulation;
  angebot: AngebotEinstellungen;
  rechnung: RechnungEinstellungen;
  ki: KiEinstellungen;
}
