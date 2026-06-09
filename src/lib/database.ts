import type { SupabaseClient } from "@supabase/supabase-js";
import type { Datei, DateiTyp, Kunde, Projekt, ProjektStatus } from "@/types";
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
