import type OpenAI from "openai";
import { chatJson, MODELLE } from "./client";
import type { KiEingabe, ProjektAnalyse } from "./typen";

type ChatCompletionContentPart =
  OpenAI.Chat.Completions.ChatCompletionContentPart;

/**
 * Schritt 1 – Projektanalyse.
 * Wertet Beschreibung, Notizen, Maße, Kundendaten, Fotos/Grundrisse (Vision)
 * und transkribierte Sprachnachrichten aus und fasst das Projekt zusammen.
 */
export async function analysiereProjekt(
  eingabe: KiEingabe,
): Promise<ProjektAnalyse> {
  const text = baueProjektText(eingabe);

  const content: ChatCompletionContentPart[] = [{ type: "text", text }];

  // Bilder & Grundrisse als Vision-Eingabe (max. 6, um Kosten zu begrenzen).
  for (const bild of eingabe.bilder.slice(0, 6)) {
    content.push({
      type: "image_url",
      image_url: { url: bild.url, detail: "low" },
    });
  }

  return chatJson<ProjektAnalyse>({
    model: eingabe.bilder.length > 0 ? MODELLE.vision : MODELLE.text,
    system:
      "Du bist ein erfahrener Trockenbau- und Handwerks-Kalkulator in Deutschland. " +
      "Analysiere das Projekt sachlich und praxisnah. Achte auf die Fotos/Grundrisse, " +
      "um Umfang, Materialien und mögliche Schwierigkeiten zu erkennen. " +
      "Antworte ausschließlich als JSON mit den Feldern: " +
      '{ "zusammenfassung": string (2-4 Sätze), "erkannteArbeiten": string[], ' +
      '"beobachtungen": string[] (aus Fotos abgeleitet), "annahmen": string[] }. ' +
      "Wenn Angaben fehlen, triff sinnvolle, konservative Annahmen und notiere sie.",
    content,
  });
}

function baueProjektText(e: KiEingabe): string {
  const zeilen: string[] = [];
  zeilen.push(`Projektname: ${e.projektname || "—"}`);
  zeilen.push(`Gewerk/Betrieb: ${e.firma.firmenname || "Handwerksbetrieb"}`);
  zeilen.push(
    `Kunde: ${e.kunde.firmenname || "—"}${e.kunde.ansprechpartner ? `, Ansprechpartner: ${e.kunde.ansprechpartner}` : ""}`,
  );
  if (e.kunde.adresse) zeilen.push(`Kundenadresse: ${e.kunde.adresse}`);
  if (e.baustellenadresse) zeilen.push(`Baustelle: ${e.baustellenadresse}`);
  zeilen.push("");
  zeilen.push(`Beschreibung: ${e.beschreibung || "—"}`);
  zeilen.push(`Notizen: ${e.notizen || "—"}`);
  zeilen.push("");
  zeilen.push("Maße:");
  zeilen.push(`- Wandfläche: ${e.masse.wandflaeche || "—"} m²`);
  zeilen.push(`- Deckenfläche: ${e.masse.deckenflaeche || "—"} m²`);
  zeilen.push(`- Raumhöhe: ${e.masse.raumhoehe || "—"} m`);
  zeilen.push(`- Sonstige Maße: ${e.masse.sonstige || "—"}`);

  if (e.audioTranskripte.length > 0) {
    zeilen.push("");
    zeilen.push("Transkribierte Sprachnachrichten:");
    e.audioTranskripte.forEach((t, i) =>
      zeilen.push(`(${i + 1}) ${t}`),
    );
  }

  if (e.pdfNamen.length > 0) {
    zeilen.push("");
    zeilen.push(
      `Beigefügte PDF-Dokumente (nur Dateinamen bekannt): ${e.pdfNamen.join(", ")}`,
    );
  }

  if (e.bilder.length > 0) {
    const grundrisse = e.bilder.filter((b) => b.art === "grundriss").length;
    const fotos = e.bilder.length - grundrisse;
    zeilen.push("");
    zeilen.push(
      `Es sind ${fotos} Baustellenfoto(s) und ${grundrisse} Grundriss(e) als Bilder angehängt.`,
    );
  }

  return zeilen.join("\n");
}
