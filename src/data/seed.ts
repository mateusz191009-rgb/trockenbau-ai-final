import type { DatenBestand } from "@/types";

/**
 * Beispiel-Daten, damit die App beim ersten Start nicht leer ist.
 * Kann in den Einstellungen jederzeit neu geladen werden.
 */
export function seedDaten(): DatenBestand {
  const jetzt = new Date();
  const vorTagen = (t: number) =>
    new Date(jetzt.getTime() - t * 24 * 60 * 60 * 1000).toISOString();

  const kunden = [
    {
      id: "kunde-1",
      firmenname: "Bauträger Sonnenhof GmbH",
      ansprechpartner: "Michael Wagner",
      telefon: "0151 23456789",
      email: "wagner@sonnenhof-bau.de",
      adresse: "Hauptstraße 12, 80331 München",
      notizen: "Zahlt immer pünktlich. Bevorzugt Termine am Vormittag.",
      erstelltAm: vorTagen(40),
    },
    {
      id: "kunde-2",
      firmenname: "Familie Becker",
      ansprechpartner: "Sandra Becker",
      telefon: "0170 9876543",
      email: "s.becker@email.de",
      adresse: "Lindenweg 5, 85221 Dachau",
      notizen: "Privater Umbau, Dachgeschoss.",
      erstelltAm: vorTagen(22),
    },
    {
      id: "kunde-3",
      firmenname: "Hausverwaltung Stadtmitte",
      ansprechpartner: "Thomas Huber",
      telefon: "089 5551234",
      email: "huber@hv-stadtmitte.de",
      adresse: "Marktplatz 3, 80333 München",
      notizen: "Mehrere Objekte, regelmäßige Aufträge.",
      erstelltAm: vorTagen(10),
    },
  ];

  const projekte = [
    {
      id: "projekt-1",
      projektname: "Trockenbau Bürogebäude 2. OG",
      kundeId: "kunde-1",
      baustellenadresse: "Gewerbepark 8, 80807 München",
      beschreibung:
        "Trennwände und abgehängte Decken für neue Büroräume im 2. Obergeschoss.",
      status: "in_arbeit" as const,
      startdatum: vorTagen(5),
      masse: {
        wandflaeche: "180",
        deckenflaeche: "95",
        raumhoehe: "2,80",
        sonstige: "3 Türöffnungen",
      },
      notizen: "Material bereits geliefert. Kran für Freitag bestellt.",
      erstelltAm: vorTagen(8),
    },
    {
      id: "projekt-2",
      projektname: "Dachgeschoss-Ausbau Becker",
      kundeId: "kunde-2",
      baustellenadresse: "Lindenweg 5, 85221 Dachau",
      beschreibung: "Ausbau des Dachgeschosses zu zwei Kinderzimmern.",
      status: "angebot" as const,
      startdatum: vorTagen(-3),
      masse: {
        wandflaeche: "65",
        deckenflaeche: "40",
        raumhoehe: "2,40",
        sonstige: "Dachschrägen beachten",
      },
      notizen: "Kundin wartet auf Angebot.",
      erstelltAm: vorTagen(6),
    },
    {
      id: "projekt-3",
      projektname: "Renovierung Treppenhaus",
      kundeId: "kunde-3",
      baustellenadresse: "Marktplatz 3, 80333 München",
      beschreibung: "Brandschutzverkleidung im Treppenhaus erneuern.",
      status: "anfrage" as const,
      startdatum: "",
      masse: { wandflaeche: "", deckenflaeche: "", raumhoehe: "", sonstige: "" },
      notizen: "Termin zur Besichtigung vereinbaren.",
      erstelltAm: vorTagen(2),
    },
    {
      id: "projekt-4",
      projektname: "Ladenlokal Umbau",
      kundeId: "kunde-1",
      baustellenadresse: "Hauptstraße 22, 80331 München",
      beschreibung: "Neue Trennwände für Verkaufsraum und Lager.",
      status: "fertig" as const,
      startdatum: vorTagen(35),
      masse: {
        wandflaeche: "120",
        deckenflaeche: "0",
        raumhoehe: "3,20",
        sonstige: "",
      },
      notizen: "Abgenommen und bezahlt.",
      erstelltAm: vorTagen(38),
    },
  ];

  const aktivitaeten = [
    {
      id: "akt-1",
      text: "Projekt „Trockenbau Bürogebäude 2. OG“ auf In Arbeit gesetzt",
      typ: "projekt" as const,
      zeit: vorTagen(5),
    },
    {
      id: "akt-2",
      text: "Angebot für „Dachgeschoss-Ausbau Becker“ erstellt",
      typ: "angebot" as const,
      zeit: vorTagen(6),
    },
    {
      id: "akt-3",
      text: "Neuer Kunde „Hausverwaltung Stadtmitte“ angelegt",
      typ: "kunde" as const,
      zeit: vorTagen(10),
    },
  ];

  return {
    kunden,
    projekte,
    dateien: [],
    aktivitaeten,
    firmendaten: {
      firmenname: "Mustermann Trockenbau",
      telefon: "089 1234567",
      email: "info@mustermann-trockenbau.de",
    },
  };
}
