import { toFile } from "openai";
import { getOpenAI, MODELLE } from "./client";

/**
 * Transkribiert eine Sprachnachricht (Audio) per OpenAI in Text.
 * Lädt die Datei über die signierte URL und schickt sie an das Audiomodell.
 * Fehler werden geschluckt (leerer String), damit eine kaputte Datei nicht
 * die ganze Angebotserstellung blockiert.
 */
export async function transkribiereAudio(
  url: string,
  dateiname: string,
): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const arrayBuffer = await res.arrayBuffer();
    const file = await toFile(
      Buffer.from(arrayBuffer),
      dateiname || "audio.webm",
      { type: res.headers.get("content-type") || "audio/webm" },
    );

    const client = getOpenAI();
    const ergebnis = await client.audio.transcriptions.create({
      file,
      model: MODELLE.transcribe,
    });
    return ergebnis.text?.trim() ?? "";
  } catch (fehler) {
    console.error("Audio-Transkription fehlgeschlagen:", fehler);
    return "";
  }
}
