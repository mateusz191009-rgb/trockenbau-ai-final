import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ladeEinstellungen, erstelleAngebot } from "@/lib/database";
import { firmenadresse } from "@/lib/ki";
import { bucketFuer } from "@/lib/storage";
import { berechneSummen } from "@/lib/angebot";
import { erzeugeAngebotsEntwurf, transkribiereAudio } from "@/lib/ai";
import type { KiBild, KiEingabe } from "@/lib/ai";
import type { DateiTyp } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ProjectRow {
  id: string;
  customer_id: string | null;
  projektname: string | null;
  baustellenadresse: string | null;
  beschreibung: string | null;
  notizen: string | null;
  wandflaeche: string | null;
  deckenflaeche: string | null;
  raumhoehe: string | null;
  sonstige_masse: string | null;
}

interface CustomerRow {
  firmenname: string | null;
  ansprechpartner: string | null;
  adresse: string | null;
}

interface FileRow {
  file_name: string;
  file_type: string;
  file_url: string;
}

export async function POST(request: Request) {
  try {
    const { projektId } = (await request.json()) as { projektId?: string };
    if (!projektId) {
      return NextResponse.json(
        { error: "projektId fehlt." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    // Projekt laden (RLS stellt sicher, dass es dem Nutzer gehört).
    const { data: projekt, error: projektFehler } = await supabase
      .from("projects")
      .select(
        "id, customer_id, projektname, baustellenadresse, beschreibung, notizen, wandflaeche, deckenflaeche, raumhoehe, sonstige_masse",
      )
      .eq("id", projektId)
      .single<ProjectRow>();
    if (projektFehler || !projekt) {
      return NextResponse.json(
        { error: "Projekt nicht gefunden." },
        { status: 404 },
      );
    }

    // Kunde laden (optional).
    let kunde: CustomerRow | null = null;
    if (projekt.customer_id) {
      const { data } = await supabase
        .from("customers")
        .select("firmenname, ansprechpartner, adresse")
        .eq("id", projekt.customer_id)
        .maybeSingle<CustomerRow>();
      kunde = data ?? null;
    }

    // Dateien laden.
    const { data: dateienData } = await supabase
      .from("project_files")
      .select("file_name, file_type, file_url")
      .eq("project_id", projektId);
    const dateien = (dateienData as FileRow[] | null) ?? [];

    // Einstellungen laden (legt bei Bedarf die Standardzeile an).
    const einstellungen = await ladeEinstellungen(supabase, user.id);

    // Signierte URLs für Bilder/Grundrisse und Audio erzeugen.
    const bilder: KiBild[] = [];
    const audioTranskripte: string[] = [];
    const pdfNamen: string[] = [];

    for (const d of dateien) {
      const typ = d.file_type as DateiTyp;
      if (typ === "bild" || typ === "grundriss") {
        const { data } = await supabase.storage
          .from(bucketFuer(typ))
          .createSignedUrl(d.file_url, 60 * 10);
        if (data?.signedUrl) {
          bilder.push({
            name: d.file_name,
            url: data.signedUrl,
            art: typ === "grundriss" ? "grundriss" : "bild",
          });
        }
      } else if (typ === "sprachnachricht") {
        const { data } = await supabase.storage
          .from(bucketFuer(typ))
          .createSignedUrl(d.file_url, 60 * 10);
        if (data?.signedUrl) {
          const text = await transkribiereAudio(data.signedUrl, d.file_name);
          if (text) audioTranskripte.push(text);
        }
      } else {
        pdfNamen.push(d.file_name);
      }
    }

    const eingabe: KiEingabe = {
      projektname: projekt.projektname ?? "",
      beschreibung: projekt.beschreibung ?? "",
      notizen: projekt.notizen ?? "",
      baustellenadresse: projekt.baustellenadresse ?? "",
      masse: {
        wandflaeche: projekt.wandflaeche ?? "",
        deckenflaeche: projekt.deckenflaeche ?? "",
        raumhoehe: projekt.raumhoehe ?? "",
        sonstige: projekt.sonstige_masse ?? "",
      },
      kunde: {
        firmenname: kunde?.firmenname ?? "",
        ansprechpartner: kunde?.ansprechpartner ?? "",
        adresse: kunde?.adresse ?? "",
      },
      firma: {
        firmenname:
          einstellungen.firma.firmenname || firmenadresse(einstellungen),
      },
      bilder,
      pdfNamen,
      audioTranskripte,
    };

    // KI-Pipeline ausführen.
    const entwurf = await erzeugeAngebotsEntwurf(eingabe, einstellungen);

    // Fortlaufende Angebotsnummer atomar aus der DB holen.
    const { data: nummer, error: nummerFehler } = await supabase.rpc(
      "naechste_angebotsnummer",
    );
    if (nummerFehler || !nummer) {
      return NextResponse.json(
        { error: "Angebotsnummer konnte nicht erzeugt werden." },
        { status: 500 },
      );
    }

    // Angebot speichern.
    const angebot = await erstelleAngebot(supabase, user.id, {
      projektId,
      kundeId: projekt.customer_id ?? "",
      nummer: nummer as string,
      titel: entwurf.titel,
      zusammenfassung: entwurf.zusammenfassung,
      leistungsbeschreibung: entwurf.leistungsbeschreibung,
      positionen: entwurf.positionen,
      arbeitsstunden: entwurf.arbeitsstunden,
      mwstSatz: einstellungen.kalkulation.mehrwertsteuer,
      zahlungsziel: einstellungen.angebot.zahlungsziel,
      gueltigkeit: einstellungen.angebot.gueltigkeit,
    });

    // Zur Info: Summen mitsenden (Client berechnet ohnehin selbst).
    const summen = berechneSummen(angebot.positionen, angebot.mwstSatz);

    return NextResponse.json({ angebot, summen });
  } catch (fehler) {
    console.error("Angebotserstellung fehlgeschlagen:", fehler);
    const message =
      fehler instanceof Error ? fehler.message : "Unbekannter Fehler.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
