import type { SupabaseClient } from "@supabase/supabase-js";
import type { DateiTyp } from "@/types";

/**
 * Storage-Schicht: Upload, Anzeige-URL und Löschen von Dateien.
 * Jeder Dateityp landet in einem eigenen Bucket.
 */

const BUCKET_FUER: Record<DateiTyp, string> = {
  bild: "images",
  grundriss: "floorplans",
  pdf: "pdfs",
  sprachnachricht: "audio",
  sonstige: "pdfs",
};

export const ALLE_BUCKETS = ["images", "pdfs", "audio", "floorplans"] as const;

export function bucketFuer(typ: DateiTyp): string {
  return BUCKET_FUER[typ];
}

function endung(name: string, mimeType: string): string {
  const ausName = name.includes(".") ? name.split(".").pop() : "";
  if (ausName) return ausName.toLowerCase();
  if (mimeType.includes("/")) return mimeType.split("/")[1];
  return "dat";
}

/**
 * Lädt eine Datei in den passenden Bucket.
 * Pfad: `${userId}/${zufalls-id}.${endung}` — die RLS-Policy erlaubt nur
 * Zugriff auf den eigenen Ordner (erster Pfadteil = user_id).
 */
export async function ladeHoch(
  supabase: SupabaseClient,
  userId: string,
  typ: DateiTyp,
  datei: Blob,
  name: string,
): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const pfad = `${userId}/${id}.${endung(name, datei.type)}`;

  const { error } = await supabase.storage
    .from(bucketFuer(typ))
    .upload(pfad, datei, {
      contentType: datei.type || undefined,
      upsert: false,
    });

  if (error) throw error;
  return pfad;
}

/** Erzeugt eine zeitlich begrenzte Anzeige-URL (1 Stunde). */
export async function signierteUrl(
  supabase: SupabaseClient,
  typ: DateiTyp,
  pfad: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketFuer(typ))
    .createSignedUrl(pfad, 60 * 60);
  if (error || !data) return "";
  return data.signedUrl;
}

export async function loescheAusStorage(
  supabase: SupabaseClient,
  typ: DateiTyp,
  pfad: string,
): Promise<void> {
  await supabase.storage.from(bucketFuer(typ)).remove([pfad]);
}

// ---------- Firmenlogo (eigener Bucket "logos") ----------

export const LOGO_BUCKET = "logos";

/**
 * Lädt ein Firmenlogo in den "logos"-Bucket.
 * Pfad: `${userId}/${zufalls-id}.${endung}` — RLS erlaubt nur den eigenen Ordner.
 */
export async function ladeLogoHoch(
  supabase: SupabaseClient,
  userId: string,
  datei: Blob,
  name: string,
): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const pfad = `${userId}/${id}.${endung(name, datei.type)}`;

  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(pfad, datei, {
      contentType: datei.type || undefined,
      upsert: true,
    });

  if (error) throw error;
  return pfad;
}

/** Zeitlich begrenzte Anzeige-URL für ein Logo (1 Stunde). */
export async function signierteLogoUrl(
  supabase: SupabaseClient,
  pfad: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(LOGO_BUCKET)
    .createSignedUrl(pfad, 60 * 60);
  if (error || !data) return "";
  return data.signedUrl;
}

export async function loescheLogo(
  supabase: SupabaseClient,
  pfad: string,
): Promise<void> {
  await supabase.storage.from(LOGO_BUCKET).remove([pfad]);
}
