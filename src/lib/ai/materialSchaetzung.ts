import { chatJson } from "./client";
import type { KiEingabe, MaterialErgebnis, ProjektAnalyse } from "./typen";

/**
 * Schritt 2 – Materialschätzung.
 * Leitet aus Analyse und Maßen eine konkrete Materialliste mit Mengen und
 * groben Einkaufs-/Rohkosten (netto, ohne Aufschlag) ab. Die Aufschläge werden
 * später in `bauePositionen()` aus den Nutzer-Einstellungen ergänzt.
 */
export async function schaetzeMaterial(
  eingabe: KiEingabe,
  analyse: ProjektAnalyse,
): Promise<MaterialErgebnis> {
  const kontext = [
    `Projekt: ${eingabe.projektname}`,
    `Zusammenfassung: ${analyse.zusammenfassung}`,
    `Erkannte Arbeiten: ${analyse.erkannteArbeiten.join("; ") || "—"}`,
    `Maße – Wand: ${eingabe.masse.wandflaeche || "—"} m², Decke: ${eingabe.masse.deckenflaeche || "—"} m², Höhe: ${eingabe.masse.raumhoehe || "—"} m, Sonstiges: ${eingabe.masse.sonstige || "—"}`,
    `Annahmen: ${analyse.annahmen.join("; ") || "—"}`,
  ].join("\n");

  return chatJson<MaterialErgebnis>({
    system:
      "Du bist ein Kalkulator für Trockenbau/Handwerk in Deutschland. " +
      "Erstelle eine realistische Materialliste für das Projekt mit handelsüblichen " +
      "Mengen und marktüblichen Netto-Einkaufspreisen in Euro (ohne Aufschlag, ohne MwSt). " +
      "Berücksichtige Verschnitt. Antworte ausschließlich als JSON: " +
      '{ "material": [ { "bezeichnung": string, "beschreibung": string, ' +
      '"menge": number, "einheit": string (z.B. "m²","Stk.","Sack","Rolle","lfm"), ' +
      '"einzelkosten": number (Netto-Rohkosten pro Einheit in Euro) } ] }. ' +
      "Gib 4 bis 12 Positionen an. Keine Arbeitszeit, nur Material.",
    content: kontext,
  });
}
