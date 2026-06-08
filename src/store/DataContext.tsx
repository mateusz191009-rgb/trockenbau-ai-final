"use client";

import * as React from "react";
import type {
  Aktivitaet,
  Datei,
  DatenBestand,
  Firmendaten,
  Kunde,
  Projekt,
} from "@/types";
import {
  ladeBestand,
  leererBestand,
  loescheBestand,
  speichereBestand,
} from "@/lib/db";
import { seedDaten } from "@/data/seed";

type KundeEingabe = Omit<Kunde, "id" | "erstelltAm">;
type ProjektEingabe = Omit<Projekt, "id" | "erstelltAm">;
type DateiEingabe = Omit<Datei, "id" | "erstelltAm">;

interface DataContextWert {
  geladen: boolean;
  speicherVoll: boolean;
  kunden: Kunde[];
  projekte: Projekt[];
  dateien: Datei[];
  aktivitaeten: Aktivitaet[];
  firmendaten: Firmendaten;

  // Kunden
  kundeAnlegen: (eingabe: KundeEingabe) => Kunde;
  kundeAktualisieren: (id: string, eingabe: KundeEingabe) => void;
  kundeLoeschen: (id: string) => void;
  getKunde: (id: string) => Kunde | undefined;
  kundenName: (id: string) => string;

  // Projekte
  projektAnlegen: (eingabe: ProjektEingabe) => Projekt;
  projektAktualisieren: (id: string, eingabe: Partial<ProjektEingabe>) => void;
  projektLoeschen: (id: string) => void;
  getProjekt: (id: string) => Projekt | undefined;

  // Dateien
  dateiHinzufuegen: (eingabe: DateiEingabe) => void;
  dateiLoeschen: (id: string) => void;
  getDateienVonProjekt: (projektId: string) => Datei[];

  // Sonstiges
  firmendatenSpeichern: (daten: Firmendaten) => void;
  beispieldatenLaden: () => void;
  alleDatenLoeschen: () => void;
}

const DataContext = React.createContext<DataContextWert | null>(null);

function neueId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [bestand, setBestand] = React.useState<DatenBestand>(leererBestand);
  const [geladen, setGeladen] = React.useState(false);
  const [speicherVoll, setSpeicherVoll] = React.useState(false);

  // Erst auf dem Client laden -> kein Hydration-Mismatch.
  React.useEffect(() => {
    setBestand(ladeBestand());
    setGeladen(true);
  }, []);

  // Bei jeder Änderung speichern (nach dem ersten Laden).
  React.useEffect(() => {
    if (!geladen) return;
    const ok = speichereBestand(bestand);
    setSpeicherVoll(!ok);
  }, [bestand, geladen]);

  const protokolliere = React.useCallback(
    (text: string, typ: Aktivitaet["typ"]) => {
      const eintrag: Aktivitaet = {
        id: neueId(),
        text,
        typ,
        zeit: new Date().toISOString(),
      };
      return eintrag;
    },
    [],
  );

  const wert = React.useMemo<DataContextWert>(() => {
    const getKunde = (id: string) => bestand.kunden.find((k) => k.id === id);

    return {
      geladen,
      speicherVoll,
      kunden: bestand.kunden,
      projekte: bestand.projekte,
      dateien: bestand.dateien,
      aktivitaeten: bestand.aktivitaeten,
      firmendaten: bestand.firmendaten,

      kundeAnlegen: (eingabe) => {
        const kunde: Kunde = {
          ...eingabe,
          id: neueId(),
          erstelltAm: new Date().toISOString(),
        };
        setBestand((b) => ({
          ...b,
          kunden: [kunde, ...b.kunden],
          aktivitaeten: [
            protokolliere(`Neuer Kunde „${kunde.firmenname}“ angelegt`, "kunde"),
            ...b.aktivitaeten,
          ].slice(0, 50),
        }));
        return kunde;
      },

      kundeAktualisieren: (id, eingabe) => {
        setBestand((b) => ({
          ...b,
          kunden: b.kunden.map((k) => (k.id === id ? { ...k, ...eingabe } : k)),
          aktivitaeten: [
            protokolliere(`Kunde „${eingabe.firmenname}“ bearbeitet`, "kunde"),
            ...b.aktivitaeten,
          ].slice(0, 50),
        }));
      },

      kundeLoeschen: (id) => {
        setBestand((b) => {
          const kunde = b.kunden.find((k) => k.id === id);
          const projektIds = b.projekte
            .filter((p) => p.kundeId === id)
            .map((p) => p.id);
          return {
            ...b,
            kunden: b.kunden.filter((k) => k.id !== id),
            // Projekte des Kunden + deren Dateien mit entfernen.
            projekte: b.projekte.filter((p) => p.kundeId !== id),
            dateien: b.dateien.filter((d) => !projektIds.includes(d.projektId)),
            aktivitaeten: [
              protokolliere(
                `Kunde „${kunde?.firmenname ?? ""}“ gelöscht`,
                "kunde",
              ),
              ...b.aktivitaeten,
            ].slice(0, 50),
          };
        });
      },

      getKunde,
      kundenName: (id) => getKunde(id)?.firmenname ?? "Unbekannter Kunde",

      projektAnlegen: (eingabe) => {
        const projekt: Projekt = {
          ...eingabe,
          id: neueId(),
          erstelltAm: new Date().toISOString(),
        };
        setBestand((b) => ({
          ...b,
          projekte: [projekt, ...b.projekte],
          aktivitaeten: [
            protokolliere(
              `Neue Baustelle „${projekt.projektname}“ angelegt`,
              "projekt",
            ),
            ...b.aktivitaeten,
          ].slice(0, 50),
        }));
        return projekt;
      },

      projektAktualisieren: (id, eingabe) => {
        setBestand((b) => {
          const vorher = b.projekte.find((p) => p.id === id);
          return {
            ...b,
            projekte: b.projekte.map((p) =>
              p.id === id ? { ...p, ...eingabe } : p,
            ),
            aktivitaeten: [
              protokolliere(
                `Baustelle „${eingabe.projektname ?? vorher?.projektname ?? ""}“ aktualisiert`,
                "projekt",
              ),
              ...b.aktivitaeten,
            ].slice(0, 50),
          };
        });
      },

      projektLoeschen: (id) => {
        setBestand((b) => {
          const projekt = b.projekte.find((p) => p.id === id);
          return {
            ...b,
            projekte: b.projekte.filter((p) => p.id !== id),
            dateien: b.dateien.filter((d) => d.projektId !== id),
            aktivitaeten: [
              protokolliere(
                `Baustelle „${projekt?.projektname ?? ""}“ gelöscht`,
                "projekt",
              ),
              ...b.aktivitaeten,
            ].slice(0, 50),
          };
        });
      },

      getProjekt: (id) => bestand.projekte.find((p) => p.id === id),

      dateiHinzufuegen: (eingabe) => {
        const datei: Datei = {
          ...eingabe,
          id: neueId(),
          erstelltAm: new Date().toISOString(),
        };
        setBestand((b) => ({
          ...b,
          dateien: [datei, ...b.dateien],
          aktivitaeten: [
            protokolliere(`Datei „${datei.name}“ hochgeladen`, "datei"),
            ...b.aktivitaeten,
          ].slice(0, 50),
        }));
      },

      dateiLoeschen: (id) => {
        setBestand((b) => ({
          ...b,
          dateien: b.dateien.filter((d) => d.id !== id),
        }));
      },

      getDateienVonProjekt: (projektId) =>
        bestand.dateien.filter((d) => d.projektId === projektId),

      firmendatenSpeichern: (daten) => {
        setBestand((b) => ({ ...b, firmendaten: daten }));
      },

      beispieldatenLaden: () => {
        setBestand(seedDaten());
      },

      alleDatenLoeschen: () => {
        loescheBestand();
        setBestand(leererBestand());
      },
    };
  }, [bestand, geladen, speicherVoll, protokolliere]);

  return <DataContext.Provider value={wert}>{children}</DataContext.Provider>;
}

export function useData(): DataContextWert {
  const ctx = React.useContext(DataContext);
  if (!ctx) {
    throw new Error("useData muss innerhalb von <DataProvider> verwendet werden");
  }
  return ctx;
}
