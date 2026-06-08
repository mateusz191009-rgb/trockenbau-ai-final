// Zentrale Datentypen der Anwendung.
// Die Struktur ist bewusst flach gehalten, damit sie später 1:1 auf
// Supabase-Tabellen abgebildet werden kann (siehe src/lib/db).

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
  erstelltAm: string; // ISO-Datum
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
  kundeId: string;
  baustellenadresse: string;
  beschreibung: string;
  status: ProjektStatus;
  startdatum: string;
  masse: Massangaben;
  notizen: string;
  erstelltAm: string;
}

export interface Datei {
  id: string;
  projektId: string;
  name: string;
  typ: DateiTyp;
  mimeType: string;
  groesse: number; // Bytes
  dataUrl: string; // Base64 Data-URL (lokal). Später: Supabase Storage URL.
  erstelltAm: string;
}

export interface Aktivitaet {
  id: string;
  text: string;
  typ: "kunde" | "projekt" | "datei" | "angebot";
  zeit: string; // ISO
}

export interface Firmendaten {
  firmenname: string;
  telefon: string;
  email: string;
}

/** Gesamter persistierter Zustand (eine localStorage-Einheit). */
export interface DatenBestand {
  kunden: Kunde[];
  projekte: Projekt[];
  dateien: Datei[];
  aktivitaeten: Aktivitaet[];
  firmendaten: Firmendaten;
}
