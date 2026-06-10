import { chatJson } from "./client";
import type { ArbeitRoh, MaterialRoh } from "@/lib/angebot";
import type { AngebotTexte, KiEingabe, ProjektAnalyse } from "./typen";

/**
 * Schritt 4 – Angebotsgenerierung.
 * Erstellt aus Analyse, Material- und Arbeitsschätzung einen kundenfreundlichen
 * Angebotstitel und eine professionelle Leistungsbeschreibung (Fließtext).
 * Die Positionen/Preise werden separat aus den Einstellungen berechnet.
 */
export async function generiereAngebotsTexte(params: {
  eingabe: KiEingabe;
  analyse: ProjektAnalyse;
  material: MaterialRoh[];
  arbeit: ArbeitRoh[];
}): Promise<AngebotTexte> {
  const { eingabe, analyse, material, arbeit } = params;

  const kontext = [
    `Betrieb: ${eingabe.firma.firmenname || "Handwerksbetrieb"}`,
    `Kunde: ${eingabe.kunde.firmenname}`,
    `Projekt: ${eingabe.projektname}`,
    `Zusammenfassung: ${analyse.zusammenfassung}`,
    `Arbeiten: ${arbeit.map((a) => a.bezeichnung).join(", ") || analyse.erkannteArbeiten.join(", ")}`,
    `Material (Auszug): ${material.map((m) => m.bezeichnung).slice(0, 10).join(", ")}`,
  ].join("\n");

  return chatJson<AngebotTexte>({
    system:
      "Du formulierst professionelle Angebote für Handwerksbetriebe in Deutschland. " +
      "Schreibe kundenfreundlich, klar und seriös (Sie-Form). " +
      "Antworte ausschließlich als JSON: " +
      '{ "titel": string (kurzer Angebotstitel), ' +
      '"leistungsbeschreibung": string (3-6 Sätze Fließtext, der die Leistungen ' +
      "zusammenfasst, ohne Preise zu nennen) }.",
    content: kontext,
  });
}
