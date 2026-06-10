import { chatJson } from "./client";
import type { ArbeitErgebnis, KiEingabe, ProjektAnalyse } from "./typen";

/**
 * Schritt 3 – Arbeitsstunden-Schätzung.
 * Schätzt die nötigen Arbeitsschritte und Stunden. Der Stundensatz kommt
 * später aus den Nutzer-Einstellungen (nicht von der KI).
 */
export async function schaetzeArbeit(
  eingabe: KiEingabe,
  analyse: ProjektAnalyse,
): Promise<ArbeitErgebnis> {
  const kontext = [
    `Projekt: ${eingabe.projektname}`,
    `Zusammenfassung: ${analyse.zusammenfassung}`,
    `Erkannte Arbeiten: ${analyse.erkannteArbeiten.join("; ") || "—"}`,
    `Maße – Wand: ${eingabe.masse.wandflaeche || "—"} m², Decke: ${eingabe.masse.deckenflaeche || "—"} m², Höhe: ${eingabe.masse.raumhoehe || "—"} m, Sonstiges: ${eingabe.masse.sonstige || "—"}`,
  ].join("\n");

  return chatJson<ArbeitErgebnis>({
    system:
      "Du bist ein erfahrener Handwerksmeister in Deutschland. " +
      "Schätze die Arbeitsschritte und den jeweiligen Zeitaufwand in Stunden " +
      "(realistisch, inkl. Vor- und Nacharbeiten) für das Projekt. " +
      "Antworte ausschließlich als JSON: " +
      '{ "arbeit": [ { "bezeichnung": string, "beschreibung": string, ' +
      '"stunden": number } ], "gesamtstunden": number }. ' +
      "Gib 2 bis 8 Arbeitspositionen an. gesamtstunden = Summe aller stunden.",
    content: kontext,
  });
}
