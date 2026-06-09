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

export interface Firmendaten {
  firmenname: string;
  telefon: string;
  email: string;
}
