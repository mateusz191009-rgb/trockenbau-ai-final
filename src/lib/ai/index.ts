import type { AngebotPosition, Einstellungen } from "@/types";
import { bauePositionen } from "@/lib/angebot";
import { analysiereProjekt } from "./projektAnalyse";
import { schaetzeMaterial } from "./materialSchaetzung";
import { schaetzeArbeit } from "./arbeitsSchaetzung";
import { generiereAngebotsTexte } from "./angebotGenerierung";
import type { KiEingabe, ProjektAnalyse } from "./typen";

export { analysiereProjekt } from "./projektAnalyse";
export { schaetzeMaterial } from "./materialSchaetzung";
export { schaetzeArbeit } from "./arbeitsSchaetzung";
export { generiereAngebotsTexte } from "./angebotGenerierung";
export { transkribiereAudio } from "./transkription";
export type * from "./typen";

/** Vollständiger Entwurf, den die KI-Pipeline zurückgibt. */
export interface AngebotsEntwurf {
  titel: string;
  zusammenfassung: string;
  leistungsbeschreibung: string;
  positionen: AngebotPosition[];
  arbeitsstunden: number;
  analyse: ProjektAnalyse;
}

/**
 * Orchestriert die vier wiederverwendbaren KI-Services zu einem fertigen
 * Angebotsentwurf. Die Preise werden deterministisch aus den gespeicherten
 * Einstellungen berechnet (nicht von der KI festgelegt).
 *
 * Die `ki`-Schalter aus den Einstellungen steuern, welche Schätzungen laufen.
 */
export async function erzeugeAngebotsEntwurf(
  eingabe: KiEingabe,
  einstellungen: Einstellungen,
): Promise<AngebotsEntwurf> {
  // Schritt 1: Analyse (immer)
  const analyse = await analysiereProjekt(eingabe);

  // Schritt 2 & 3: Material- und Arbeitsschätzung (parallel, je nach Schaltern)
  const [materialErgebnis, arbeitErgebnis] = await Promise.all([
    einstellungen.ki.materialSchaetzen
      ? schaetzeMaterial(eingabe, analyse)
      : Promise.resolve({ material: [] }),
    einstellungen.ki.arbeitsstundenSchaetzen
      ? schaetzeArbeit(eingabe, analyse)
      : Promise.resolve({ arbeit: [], gesamtstunden: 0 }),
  ]);

  // Schritt 4: Angebotstexte
  const texte = await generiereAngebotsTexte({
    eingabe,
    analyse,
    material: materialErgebnis.material,
    arbeit: arbeitErgebnis.arbeit,
  });

  // Preise/Positionen aus Einstellungen ableiten.
  const positionen = bauePositionen(
    materialErgebnis.material,
    arbeitErgebnis.arbeit,
    einstellungen,
  );

  return {
    titel: texte.titel || eingabe.projektname,
    zusammenfassung: analyse.zusammenfassung,
    leistungsbeschreibung: texte.leistungsbeschreibung,
    positionen,
    arbeitsstunden: arbeitErgebnis.gesamtstunden,
    analyse,
  };
}
