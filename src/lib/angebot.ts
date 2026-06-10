import type { AngebotPosition, AngebotPositionArt, Einstellungen } from "@/types";

/**
 * Angebots-Berechnung
 * -------------------
 * Reine, deterministische Hilfsfunktionen für die Kalkulation eines Angebots.
 * Die KI liefert nur Mengen/Stunden und grobe Materialkosten — die finalen
 * Preise werden hier aus den gespeicherten Einstellungen abgeleitet, damit die
 * Berechnung nachvollziehbar bleibt und immer die Nutzerwerte verwendet werden.
 */

/** Summe einer einzelnen Position (Menge × Einzelpreis). */
export function positionsSumme(p: AngebotPosition): number {
  const wert = (Number(p.menge) || 0) * (Number(p.einzelpreis) || 0);
  return runde(wert);
}

/** Kaufmännisch auf 2 Nachkommastellen runden. */
export function runde(wert: number): number {
  return Math.round((wert + Number.EPSILON) * 100) / 100;
}

export interface AngebotSummen {
  /** Nettobetrag je Positionsart. */
  proArt: Record<AngebotPositionArt, number>;
  netto: number;
  mwstBetrag: number;
  brutto: number;
}

/** Berechnet alle Summen eines Angebots aus seinen Positionen. */
export function berechneSummen(
  positionen: AngebotPosition[],
  mwstSatz: number,
): AngebotSummen {
  const proArt: Record<AngebotPositionArt, number> = {
    material: 0,
    arbeit: 0,
    fahrt: 0,
    sonstige: 0,
  };

  for (const p of positionen) {
    proArt[p.art] = runde(proArt[p.art] + positionsSumme(p));
  }

  const netto = runde(
    proArt.material + proArt.arbeit + proArt.fahrt + proArt.sonstige,
  );
  const mwstBetrag = runde((netto * (Number(mwstSatz) || 0)) / 100);
  const brutto = runde(netto + mwstBetrag);

  return { proArt, netto, mwstBetrag, brutto };
}

/** Eingabe der KI für eine Materialposition (Rohkosten ohne Aufschlag). */
export interface MaterialRoh {
  bezeichnung: string;
  beschreibung?: string;
  menge: number;
  einheit: string;
  einzelkosten: number; // Einkaufs-/Rohkosten netto pro Einheit
}

/** Eingabe der KI für eine Arbeitsposition. */
export interface ArbeitRoh {
  bezeichnung: string;
  beschreibung?: string;
  stunden: number;
}

let zaehler = 0;
function neueId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  zaehler += 1;
  return `${prefix}-${Date.now()}-${zaehler}`;
}

/**
 * Baut die finalen Angebotspositionen aus den KI-Rohdaten und den
 * gespeicherten Kalkulations-Einstellungen.
 *
 * - Material: Einzelkosten × (1 + Materialaufschlag%) × (1 + Gewinnmarge%)
 * - Arbeit:   Stundenlohn × (1 + Gewinnmarge%)
 * - Anfahrt:  Mindestanfahrt (sofern > 0)
 * - Entsorgung: Entsorgungspauschale (sofern > 0)
 */
export function bauePositionen(
  material: MaterialRoh[],
  arbeit: ArbeitRoh[],
  e: Einstellungen,
): AngebotPosition[] {
  const k = e.kalkulation;
  const materialFaktor =
    (1 + (k.materialaufschlag || 0) / 100) * (1 + (k.gewinnmarge || 0) / 100);
  const arbeitFaktor = 1 + (k.gewinnmarge || 0) / 100;

  const positionen: AngebotPosition[] = [];

  for (const m of material) {
    positionen.push({
      id: neueId("mat"),
      art: "material",
      bezeichnung: m.bezeichnung,
      beschreibung: m.beschreibung ?? "",
      menge: runde(m.menge || 0),
      einheit: m.einheit || "Stk.",
      einzelpreis: runde((m.einzelkosten || 0) * materialFaktor),
    });
  }

  for (const a of arbeit) {
    positionen.push({
      id: neueId("arb"),
      art: "arbeit",
      bezeichnung: a.bezeichnung,
      beschreibung: a.beschreibung ?? "",
      menge: runde(a.stunden || 0),
      einheit: "Std.",
      einzelpreis: runde((k.stundenlohn || 0) * arbeitFaktor),
    });
  }

  if ((k.mindestanfahrt || 0) > 0) {
    positionen.push({
      id: neueId("fahrt"),
      art: "fahrt",
      bezeichnung: "Anfahrt",
      beschreibung: "",
      menge: 1,
      einheit: "pauschal",
      einzelpreis: runde(k.mindestanfahrt),
    });
  }

  if ((k.entsorgungspauschale || 0) > 0) {
    positionen.push({
      id: neueId("sonst"),
      art: "sonstige",
      bezeichnung: "Entsorgung",
      beschreibung: "",
      menge: 1,
      einheit: "pauschal",
      einzelpreis: runde(k.entsorgungspauschale),
    });
  }

  return positionen;
}

/** Erzeugt eine leere Position (für „Position hinzufügen“ im Editor). */
export function leerePosition(art: AngebotPositionArt = "sonstige"): AngebotPosition {
  return {
    id: neueId("neu"),
    art,
    bezeichnung: "",
    beschreibung: "",
    menge: 1,
    einheit: art === "arbeit" ? "Std." : "Stk.",
    einzelpreis: 0,
  };
}

/** Geldbetrag im deutschen Format, z. B. "1.234,56 €". */
export function formatEuro(wert: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(wert) ? wert : 0);
}

/** Zahl im deutschen Format ohne Währungssymbol, z. B. "12,5". */
export function formatZahl(wert: number): string {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(wert) ? wert : 0);
}
