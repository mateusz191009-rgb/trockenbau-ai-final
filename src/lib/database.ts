import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Datei,
  DateiTyp,
  Einstellungen,
  Kunde,
  Projekt,
  ProjektStatus,
} from "@/types";
import { signierteUrl } from "@/lib/storage";

/**
 * Datenbank-Schicht: liest und schreibt die Supabase-Tabellen
 * `customers`, `projects` und `project_files` und wandelt zwischen
 * Datenbank-Zeilen (snake_case) und App-Typen um.
 *
 * Row Level Security stellt sicher, dass jeder Nutzer nur seine eigenen
 * Datensätze sieht — wir müssen hier also nicht zusätzlich nach user_id filtern.
 */

// ---------- Roh-Typen (wie in der Datenbank) ----------

interface CustomerRow {
  id: string;
  user_id: string;
  firmenname: string | null;
  ansprechpartner: string | null;
  telefon: string | null;
  email: string | null;
  adresse: string | null;
  notizen: string | null;
  created_at: string;
}

interface ProjectRow {
  id: string;
  user_id: string;
  customer_id: string | null;
  projektname: string | null;
  baustellenadresse: string | null;
  beschreibung: string | null;
  status: string | null;
  startdatum: string | null;
  enddatum: string | null;
  notizen: string | null;
  wandflaeche: string | null;
  deckenflaeche: string | null;
  raumhoehe: string | null;
  sonstige_masse: string | null;
  created_at: string;
}

interface ProjectFileRow {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
}

// ---------- Mapping ----------

function rowZuKunde(r: CustomerRow): Kunde {
  return {
    id: r.id,
    firmenname: r.firmenname ?? "",
    ansprechpartner: r.ansprechpartner ?? "",
    telefon: r.telefon ?? "",
    email: r.email ?? "",
    adresse: r.adresse ?? "",
    notizen: r.notizen ?? "",
    erstelltAm: r.created_at,
  };
}

function rowZuProjekt(r: ProjectRow): Projekt {
  return {
    id: r.id,
    projektname: r.projektname ?? "",
    kundeId: r.customer_id ?? "",
    baustellenadresse: r.baustellenadresse ?? "",
    beschreibung: r.beschreibung ?? "",
    status: (r.status as ProjektStatus) ?? "anfrage",
    startdatum: r.startdatum ?? "",
    enddatum: r.enddatum ?? "",
    masse: {
      wandflaeche: r.wandflaeche ?? "",
      deckenflaeche: r.deckenflaeche ?? "",
      raumhoehe: r.raumhoehe ?? "",
      sonstige: r.sonstige_masse ?? "",
    },
    notizen: r.notizen ?? "",
    erstelltAm: r.created_at,
  };
}

// ---------- Kunden ----------

export type KundeEingabe = Omit<Kunde, "id" | "erstelltAm">;

export async function ladeKunden(supabase: SupabaseClient): Promise<Kunde[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CustomerRow[]).map(rowZuKunde);
}

export async function erstelleKunde(
  supabase: SupabaseClient,
  userId: string,
  e: KundeEingabe,
): Promise<Kunde> {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      firmenname: e.firmenname,
      ansprechpartner: e.ansprechpartner,
      telefon: e.telefon,
      email: e.email,
      adresse: e.adresse,
      notizen: e.notizen,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowZuKunde(data as CustomerRow);
}

export async function aktualisiereKunde(
  supabase: SupabaseClient,
  id: string,
  e: KundeEingabe,
): Promise<Kunde> {
  const { data, error } = await supabase
    .from("customers")
    .update({
      firmenname: e.firmenname,
      ansprechpartner: e.ansprechpartner,
      telefon: e.telefon,
      email: e.email,
      adresse: e.adresse,
      notizen: e.notizen,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowZuKunde(data as CustomerRow);
}

export async function loescheKunde(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Projekte ----------

export type ProjektEingabe = Omit<Projekt, "id" | "erstelltAm">;

export async function ladeProjekte(
  supabase: SupabaseClient,
): Promise<Projekt[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProjectRow[]).map(rowZuProjekt);
}

/** Wandelt App-Felder in DB-Spalten um (nur gesetzte Felder). */
function projektZuSpalten(e: Partial<ProjektEingabe>) {
  const s: Record<string, unknown> = {};
  if (e.projektname !== undefined) s.projektname = e.projektname;
  if (e.kundeId !== undefined) s.customer_id = e.kundeId || null;
  if (e.baustellenadresse !== undefined)
    s.baustellenadresse = e.baustellenadresse;
  if (e.beschreibung !== undefined) s.beschreibung = e.beschreibung;
  if (e.status !== undefined) s.status = e.status;
  if (e.startdatum !== undefined) s.startdatum = e.startdatum || null;
  if (e.enddatum !== undefined) s.enddatum = e.enddatum || null;
  if (e.notizen !== undefined) s.notizen = e.notizen;
  if (e.masse !== undefined) {
    s.wandflaeche = e.masse.wandflaeche;
    s.deckenflaeche = e.masse.deckenflaeche;
    s.raumhoehe = e.masse.raumhoehe;
    s.sonstige_masse = e.masse.sonstige;
  }
  return s;
}

export async function erstelleProjekt(
  supabase: SupabaseClient,
  userId: string,
  e: ProjektEingabe,
): Promise<Projekt> {
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: userId, ...projektZuSpalten(e) })
    .select("*")
    .single();
  if (error) throw error;
  return rowZuProjekt(data as ProjectRow);
}

export async function aktualisiereProjekt(
  supabase: SupabaseClient,
  id: string,
  e: Partial<ProjektEingabe>,
): Promise<Projekt> {
  const { data, error } = await supabase
    .from("projects")
    .update(projektZuSpalten(e))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowZuProjekt(data as ProjectRow);
}

export async function loescheProjekt(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Dateien ----------

export async function ladeDateien(
  supabase: SupabaseClient,
): Promise<Datei[]> {
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = data as ProjectFileRow[];
  // Anzeige-URLs parallel signieren.
  return Promise.all(
    rows.map(async (r) => {
      const typ = (r.file_type as DateiTyp) ?? "sonstige";
      const dataUrl = await signierteUrl(supabase, typ, r.file_url);
      return rowZuDatei(r, dataUrl);
    }),
  );
}

function rowZuDatei(r: ProjectFileRow, dataUrl: string): Datei {
  return {
    id: r.id,
    projektId: r.project_id,
    name: r.file_name,
    typ: (r.file_type as DateiTyp) ?? "sonstige",
    mimeType: r.mime_type ?? "",
    groesse: r.file_size ?? 0,
    path: r.file_url,
    dataUrl,
    erstelltAm: r.created_at,
  };
}

export interface DateiEingabe {
  projektId: string;
  name: string;
  typ: DateiTyp;
  mimeType: string;
  groesse: number;
  path: string;
  dataUrl: string;
}

export async function erstelleDatei(
  supabase: SupabaseClient,
  userId: string,
  e: DateiEingabe,
): Promise<Datei> {
  const { data, error } = await supabase
    .from("project_files")
    .insert({
      project_id: e.projektId,
      user_id: userId,
      file_name: e.name,
      file_type: e.typ,
      file_url: e.path,
      mime_type: e.mimeType,
      file_size: e.groesse,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowZuDatei(data as ProjectFileRow, e.dataUrl);
}

export async function loescheDateiZeile(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("project_files").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Einstellungen (user_settings) ----------

interface UserSettingsRow {
  user_id: string;
  firmenname: string | null;
  inhaber: string | null;
  ansprechpartner: string | null;
  strasse: string | null;
  hausnummer: string | null;
  plz: string | null;
  ort: string | null;
  telefon: string | null;
  mobil: string | null;
  email: string | null;
  website: string | null;
  ust_id: string | null;
  logo_path: string | null;
  stundenlohn: number | null;
  materialaufschlag: number | null;
  gewinnmarge: number | null;
  fahrtkosten_pro_km: number | null;
  mindestanfahrt: number | null;
  entsorgungspauschale: number | null;
  mehrwertsteuer: number | null;
  angebot_praefix: string | null;
  angebot_nummer: number | null;
  angebot_zahlungsziel: number | null;
  angebot_gueltigkeit: number | null;
  rechnung_praefix: string | null;
  rechnung_nummer: number | null;
  rechnung_zahlungsziel: number | null;
  bankname: string | null;
  iban: string | null;
  bic: string | null;
  ki_material: boolean | null;
  ki_arbeitsstunden: boolean | null;
  ki_preise: boolean | null;
}

/** Standard-Einstellungen — identisch zu den DB-Defaults der Migration. */
export const EINSTELLUNGEN_STANDARD: Einstellungen = {
  firma: {
    firmenname: "",
    inhaber: "",
    ansprechpartner: "",
    strasse: "",
    hausnummer: "",
    plz: "",
    ort: "",
    telefon: "",
    mobil: "",
    email: "",
    website: "",
    ustId: "",
  },
  logoPfad: null,
  kalkulation: {
    stundenlohn: 0,
    materialaufschlag: 0,
    gewinnmarge: 0,
    fahrtkostenProKm: 0,
    mindestanfahrt: 0,
    entsorgungspauschale: 0,
    mehrwertsteuer: 19,
  },
  angebot: {
    praefix: "ANG-2026-",
    aktuelleNummer: 1,
    zahlungsziel: 14,
    gueltigkeit: 30,
  },
  rechnung: {
    praefix: "RE-2026-",
    aktuelleNummer: 1,
    zahlungsziel: 14,
    bankname: "",
    iban: "",
    bic: "",
  },
  ki: {
    materialSchaetzen: true,
    arbeitsstundenSchaetzen: true,
    preiseVorschlagen: true,
  },
};

const num = (v: number | null, fallback: number) =>
  v === null || v === undefined ? fallback : Number(v);
const txt = (v: string | null) => v ?? "";
const bool = (v: boolean | null) => (v === null || v === undefined ? true : v);

function rowZuEinstellungen(r: UserSettingsRow): Einstellungen {
  const s = EINSTELLUNGEN_STANDARD;
  return {
    firma: {
      firmenname: txt(r.firmenname),
      inhaber: txt(r.inhaber),
      ansprechpartner: txt(r.ansprechpartner),
      strasse: txt(r.strasse),
      hausnummer: txt(r.hausnummer),
      plz: txt(r.plz),
      ort: txt(r.ort),
      telefon: txt(r.telefon),
      mobil: txt(r.mobil),
      email: txt(r.email),
      website: txt(r.website),
      ustId: txt(r.ust_id),
    },
    logoPfad: r.logo_path,
    kalkulation: {
      stundenlohn: num(r.stundenlohn, 0),
      materialaufschlag: num(r.materialaufschlag, 0),
      gewinnmarge: num(r.gewinnmarge, 0),
      fahrtkostenProKm: num(r.fahrtkosten_pro_km, 0),
      mindestanfahrt: num(r.mindestanfahrt, 0),
      entsorgungspauschale: num(r.entsorgungspauschale, 0),
      mehrwertsteuer: num(r.mehrwertsteuer, 19),
    },
    angebot: {
      praefix: r.angebot_praefix ?? s.angebot.praefix,
      aktuelleNummer: num(r.angebot_nummer, 1),
      zahlungsziel: num(r.angebot_zahlungsziel, 14),
      gueltigkeit: num(r.angebot_gueltigkeit, 30),
    },
    rechnung: {
      praefix: r.rechnung_praefix ?? s.rechnung.praefix,
      aktuelleNummer: num(r.rechnung_nummer, 1),
      zahlungsziel: num(r.rechnung_zahlungsziel, 14),
      bankname: txt(r.bankname),
      iban: txt(r.iban),
      bic: txt(r.bic),
    },
    ki: {
      materialSchaetzen: bool(r.ki_material),
      arbeitsstundenSchaetzen: bool(r.ki_arbeitsstunden),
      preiseVorschlagen: bool(r.ki_preise),
    },
  };
}

function einstellungenZuRow(e: Einstellungen): Omit<UserSettingsRow, "user_id"> {
  return {
    firmenname: e.firma.firmenname,
    inhaber: e.firma.inhaber,
    ansprechpartner: e.firma.ansprechpartner,
    strasse: e.firma.strasse,
    hausnummer: e.firma.hausnummer,
    plz: e.firma.plz,
    ort: e.firma.ort,
    telefon: e.firma.telefon,
    mobil: e.firma.mobil,
    email: e.firma.email,
    website: e.firma.website,
    ust_id: e.firma.ustId,
    logo_path: e.logoPfad,
    stundenlohn: e.kalkulation.stundenlohn,
    materialaufschlag: e.kalkulation.materialaufschlag,
    gewinnmarge: e.kalkulation.gewinnmarge,
    fahrtkosten_pro_km: e.kalkulation.fahrtkostenProKm,
    mindestanfahrt: e.kalkulation.mindestanfahrt,
    entsorgungspauschale: e.kalkulation.entsorgungspauschale,
    mehrwertsteuer: e.kalkulation.mehrwertsteuer,
    angebot_praefix: e.angebot.praefix,
    angebot_nummer: e.angebot.aktuelleNummer,
    angebot_zahlungsziel: e.angebot.zahlungsziel,
    angebot_gueltigkeit: e.angebot.gueltigkeit,
    rechnung_praefix: e.rechnung.praefix,
    rechnung_nummer: e.rechnung.aktuelleNummer,
    rechnung_zahlungsziel: e.rechnung.zahlungsziel,
    bankname: e.rechnung.bankname,
    iban: e.rechnung.iban,
    bic: e.rechnung.bic,
    ki_material: e.ki.materialSchaetzen,
    ki_arbeitsstunden: e.ki.arbeitsstundenSchaetzen,
    ki_preise: e.ki.preiseVorschlagen,
  };
}

/**
 * Lädt die Einstellungen des Nutzers. Existiert noch keine Zeile, wird
 * eine mit den Standardwerten angelegt (RLS schützt nach user_id).
 */
export async function ladeEinstellungen(
  supabase: SupabaseClient,
  userId: string,
): Promise<Einstellungen> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  if (data) return rowZuEinstellungen(data as UserSettingsRow);

  // Noch keine Einstellungen: Standardzeile anlegen.
  const { data: neu, error: insertError } = await supabase
    .from("user_settings")
    .insert({ user_id: userId })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return rowZuEinstellungen(neu as UserSettingsRow);
}

/** Speichert die Einstellungen des Nutzers (Upsert auf user_id). */
export async function speichereEinstellungen(
  supabase: SupabaseClient,
  userId: string,
  e: Einstellungen,
): Promise<Einstellungen> {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, ...einstellungenZuRow(e) }, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return rowZuEinstellungen(data as UserSettingsRow);
}

/** Speichert nur den Logo-Pfad (oder null beim Löschen). */
export async function speichereLogoPfad(
  supabase: SupabaseClient,
  userId: string,
  logoPfad: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, logo_path: logoPfad }, { onConflict: "user_id" });
  if (error) throw error;
}
