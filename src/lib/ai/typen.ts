import type { ArbeitRoh, MaterialRoh } from "@/lib/angebot";

/**
 * Gemeinsame Ein-/Ausgabetypen der KI-Services.
 * Die API-Route bereitet aus Projekt, Kunde, Dateien und Einstellungen ein
 * `KiEingabe`-Objekt auf und reicht es durch die einzelnen Services.
 */

export interface KiBild {
  name: string;
  /** Signierte (zeitlich begrenzte) URL aus dem Supabase-Storage. */
  url: string;
  /** "bild" oder "grundriss" — hilft der KI bei der Einordnung. */
  art: "bild" | "grundriss";
}

export interface KiEingabe {
  projektname: string;
  beschreibung: string;
  notizen: string;
  baustellenadresse: string;
  masse: {
    wandflaeche: string;
    deckenflaeche: string;
    raumhoehe: string;
    sonstige: string;
  };
  kunde: {
    firmenname: string;
    ansprechpartner: string;
    adresse: string;
  };
  firma: {
    firmenname: string;
  };
  bilder: KiBild[];
  pdfNamen: string[];
  audioTranskripte: string[];
}

/** Ergebnis der Projektanalyse (Schritt 1). */
export interface ProjektAnalyse {
  zusammenfassung: string;
  erkannteArbeiten: string[];
  beobachtungen: string[];
  annahmen: string[];
}

/** Ergebnis der Materialschätzung (Schritt 2). */
export interface MaterialErgebnis {
  material: MaterialRoh[];
}

/** Ergebnis der Arbeitsschätzung (Schritt 3). */
export interface ArbeitErgebnis {
  arbeit: ArbeitRoh[];
  gesamtstunden: number;
}

/** Ergebnis der Angebotsgenerierung (Schritt 4). */
export interface AngebotTexte {
  titel: string;
  leistungsbeschreibung: string;
}
