"use client";

import * as React from "react";
import type { Aktivitaet, Datei, Firmendaten, Kunde, Projekt } from "@/types";
import { useAuth } from "@/store/AuthContext";
import {
  aktualisiereKunde,
  aktualisiereProjekt,
  erstelleDatei,
  erstelleKunde,
  erstelleProjekt,
  ladeDateien,
  ladeKunden,
  ladeProjekte,
  loescheDateiZeile,
  loescheKunde,
  loescheProjekt,
  type KundeEingabe,
  type ProjektEingabe,
} from "@/lib/database";
import { erkenneDateiTyp } from "@/lib/status";
import { ladeHoch, loescheAusStorage, signierteUrl } from "@/lib/storage";

interface DataContextWert {
  geladen: boolean;
  kunden: Kunde[];
  projekte: Projekt[];
  dateien: Datei[];
  aktivitaeten: Aktivitaet[];
  firmendaten: Firmendaten;

  // Kunden
  kundeAnlegen: (eingabe: KundeEingabe) => Promise<Kunde>;
  kundeAktualisieren: (id: string, eingabe: KundeEingabe) => Promise<void>;
  kundeLoeschen: (id: string) => Promise<void>;
  getKunde: (id: string) => Kunde | undefined;
  kundenName: (id: string) => string;

  // Projekte
  projektAnlegen: (eingabe: ProjektEingabe) => Promise<Projekt>;
  projektAktualisieren: (
    id: string,
    eingabe: Partial<ProjektEingabe>,
  ) => Promise<void>;
  projektLoeschen: (id: string) => Promise<void>;
  getProjekt: (id: string) => Projekt | undefined;

  // Dateien
  dateiHochladen: (projektId: string, datei: Blob, name: string) => Promise<void>;
  dateiLoeschen: (id: string) => Promise<void>;
  getDateienVonProjekt: (projektId: string) => Datei[];

  // Firmendaten (lokale Einstellung)
  firmendatenSpeichern: (daten: Firmendaten) => void;
}

const DataContext = React.createContext<DataContextWert | null>(null);

const FIRMA_KEY = "trockenbau-ai:firmendaten";
const FIRMA_LEER: Firmendaten = { firmenname: "", telefon: "", email: "" };

function ladeFirmendaten(): Firmendaten {
  if (typeof window === "undefined") return FIRMA_LEER;
  try {
    const roh = window.localStorage.getItem(FIRMA_KEY);
    return roh ? { ...FIRMA_LEER, ...JSON.parse(roh) } : FIRMA_LEER;
  } catch {
    return FIRMA_LEER;
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { supabase, user, loading: authLoading } = useAuth();

  const [kunden, setKunden] = React.useState<Kunde[]>([]);
  const [projekte, setProjekte] = React.useState<Projekt[]>([]);
  const [dateien, setDateien] = React.useState<Datei[]>([]);
  const [geladen, setGeladen] = React.useState(false);
  const [firmendaten, setFirmendaten] = React.useState<Firmendaten>(FIRMA_LEER);

  React.useEffect(() => {
    setFirmendaten(ladeFirmendaten());
  }, []);

  // Daten laden, sobald der Login-Status feststeht.
  React.useEffect(() => {
    let aktiv = true;

    async function laden() {
      if (authLoading) return;
      if (!user) {
        setKunden([]);
        setProjekte([]);
        setDateien([]);
        setGeladen(true);
        return;
      }
      setGeladen(false);
      try {
        const [k, p, d] = await Promise.all([
          ladeKunden(supabase),
          ladeProjekte(supabase),
          ladeDateien(supabase),
        ]);
        if (!aktiv) return;
        setKunden(k);
        setProjekte(p);
        setDateien(d);
      } catch (fehler) {
        console.error("Daten konnten nicht geladen werden:", fehler);
      } finally {
        if (aktiv) setGeladen(true);
      }
    }

    laden();
    return () => {
      aktiv = false;
    };
  }, [supabase, user, authLoading]);

  const userId = user?.id;

  const aktivitaeten = React.useMemo<Aktivitaet[]>(() => {
    const items: Aktivitaet[] = [];
    kunden.forEach((k) =>
      items.push({
        id: `k-${k.id}`,
        text: `Kunde „${k.firmenname}“ angelegt`,
        typ: "kunde",
        zeit: k.erstelltAm,
      }),
    );
    projekte.forEach((p) =>
      items.push({
        id: `p-${p.id}`,
        text: `Baustelle „${p.projektname}“ angelegt`,
        typ: "projekt",
        zeit: p.erstelltAm,
      }),
    );
    dateien.forEach((d) =>
      items.push({
        id: `d-${d.id}`,
        text: `Datei „${d.name}“ hochgeladen`,
        typ: "datei",
        zeit: d.erstelltAm,
      }),
    );
    return items
      .sort((a, b) => b.zeit.localeCompare(a.zeit))
      .slice(0, 8);
  }, [kunden, projekte, dateien]);

  const wert = React.useMemo<DataContextWert>(() => {
    const getKunde = (id: string) => kunden.find((k) => k.id === id);

    return {
      geladen,
      kunden,
      projekte,
      dateien,
      aktivitaeten,
      firmendaten,

      kundeAnlegen: async (eingabe) => {
        if (!userId) throw new Error("Nicht angemeldet");
        const kunde = await erstelleKunde(supabase, userId, eingabe);
        setKunden((prev) => [kunde, ...prev]);
        return kunde;
      },

      kundeAktualisieren: async (id, eingabe) => {
        const kunde = await aktualisiereKunde(supabase, id, eingabe);
        setKunden((prev) => prev.map((k) => (k.id === id ? kunde : k)));
      },

      kundeLoeschen: async (id) => {
        await loescheKunde(supabase, id);
        // Projekte + Dateien des Kunden werden per DB-Cascade entfernt.
        const projektIds = projekte
          .filter((p) => p.kundeId === id)
          .map((p) => p.id);
        setKunden((prev) => prev.filter((k) => k.id !== id));
        setProjekte((prev) => prev.filter((p) => p.kundeId !== id));
        setDateien((prev) =>
          prev.filter((d) => !projektIds.includes(d.projektId)),
        );
      },

      getKunde,
      kundenName: (id) => getKunde(id)?.firmenname ?? "Kein Kunde",

      projektAnlegen: async (eingabe) => {
        if (!userId) throw new Error("Nicht angemeldet");
        const projekt = await erstelleProjekt(supabase, userId, eingabe);
        setProjekte((prev) => [projekt, ...prev]);
        return projekt;
      },

      projektAktualisieren: async (id, eingabe) => {
        const projekt = await aktualisiereProjekt(supabase, id, eingabe);
        setProjekte((prev) => prev.map((p) => (p.id === id ? projekt : p)));
      },

      projektLoeschen: async (id) => {
        await loescheProjekt(supabase, id);
        setProjekte((prev) => prev.filter((p) => p.id !== id));
        setDateien((prev) => prev.filter((d) => d.projektId !== id));
      },

      getProjekt: (id) => projekte.find((p) => p.id === id),

      dateiHochladen: async (projektId, datei, name) => {
        if (!userId) throw new Error("Nicht angemeldet");
        const typ = erkenneDateiTyp(datei.type, name);
        const pfad = await ladeHoch(supabase, userId, typ, datei, name);
        const dataUrl = await signierteUrl(supabase, typ, pfad);
        const neu = await erstelleDatei(supabase, userId, {
          projektId,
          name,
          typ,
          mimeType: datei.type || "application/octet-stream",
          groesse: datei.size,
          path: pfad,
          dataUrl,
        });
        setDateien((prev) => [neu, ...prev]);
      },

      dateiLoeschen: async (id) => {
        const datei = dateien.find((d) => d.id === id);
        if (datei) {
          await loescheAusStorage(supabase, datei.typ, datei.path);
        }
        await loescheDateiZeile(supabase, id);
        setDateien((prev) => prev.filter((d) => d.id !== id));
      },

      getDateienVonProjekt: (projektId) =>
        dateien.filter((d) => d.projektId === projektId),

      firmendatenSpeichern: (daten) => {
        setFirmendaten(daten);
        try {
          window.localStorage.setItem(FIRMA_KEY, JSON.stringify(daten));
        } catch {
          /* Speicher voll – ignorieren */
        }
      },
    };
  }, [
    supabase,
    userId,
    geladen,
    kunden,
    projekte,
    dateien,
    aktivitaeten,
    firmendaten,
  ]);

  return <DataContext.Provider value={wert}>{children}</DataContext.Provider>;
}

export function useData(): DataContextWert {
  const ctx = React.useContext(DataContext);
  if (!ctx) {
    throw new Error("useData muss innerhalb von <DataProvider> verwendet werden");
  }
  return ctx;
}
