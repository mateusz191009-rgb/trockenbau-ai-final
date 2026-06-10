"use client";

import * as React from "react";
import type {
  Aktivitaet,
  Angebot,
  Datei,
  Einstellungen,
  Firmendaten,
  Kunde,
  Projekt,
} from "@/types";
import { useAuth } from "@/store/AuthContext";
import {
  aktualisiereAngebot,
  aktualisiereKunde,
  aktualisiereProjekt,
  EINSTELLUNGEN_STANDARD,
  erstelleDatei,
  erstelleKunde,
  erstelleProjekt,
  ladeAngebote,
  ladeDateien,
  ladeEinstellungen,
  ladeKunden,
  ladeProjekte,
  loescheAngebot,
  loescheDateiZeile,
  loescheKunde,
  loescheProjekt,
  speichereEinstellungen,
  speichereLogoPfad,
  type KundeEingabe,
  type ProjektEingabe,
} from "@/lib/database";
import { erkenneDateiTyp } from "@/lib/status";
import {
  ladeHoch,
  ladeLogoHoch,
  loescheAusStorage,
  loescheLogo,
  signierteLogoUrl,
  signierteUrl,
} from "@/lib/storage";

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

  // Angebote (KI-generiert, danach bearbeitbar)
  angebote: Angebot[];
  getAngebot: (id: string) => Angebot | undefined;
  getAngeboteVonProjekt: (projektId: string) => Angebot[];
  angebotErstellenKi: (projektId: string) => Promise<Angebot>;
  angebotAktualisieren: (id: string, patch: Partial<Angebot>) => Promise<void>;
  angebotLoeschen: (id: string) => Promise<void>;

  // Einstellungen (pro Nutzer, in Supabase gespeichert)
  einstellungen: Einstellungen;
  logoUrl: string | null;
  einstellungenSpeichern: (daten: Einstellungen) => Promise<void>;
  logoHochladen: (datei: Blob, name: string) => Promise<void>;
  logoLoeschen: () => Promise<void>;
}

const DataContext = React.createContext<DataContextWert | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { supabase, user, loading: authLoading } = useAuth();

  const [kunden, setKunden] = React.useState<Kunde[]>([]);
  const [projekte, setProjekte] = React.useState<Projekt[]>([]);
  const [dateien, setDateien] = React.useState<Datei[]>([]);
  const [angebote, setAngebote] = React.useState<Angebot[]>([]);
  const [geladen, setGeladen] = React.useState(false);
  const [einstellungen, setEinstellungen] = React.useState<Einstellungen>(
    EINSTELLUNGEN_STANDARD,
  );
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  // Daten laden, sobald der Login-Status feststeht.
  React.useEffect(() => {
    let aktiv = true;

    async function laden() {
      if (authLoading) return;
      if (!user) {
        setKunden([]);
        setProjekte([]);
        setDateien([]);
        setAngebote([]);
        setEinstellungen(EINSTELLUNGEN_STANDARD);
        setLogoUrl(null);
        setGeladen(true);
        return;
      }
      setGeladen(false);
      try {
        const [k, p, d, a, e] = await Promise.all([
          ladeKunden(supabase),
          ladeProjekte(supabase),
          ladeDateien(supabase),
          ladeAngebote(supabase),
          ladeEinstellungen(supabase, user.id),
        ]);
        if (!aktiv) return;
        setKunden(k);
        setProjekte(p);
        setDateien(d);
        setAngebote(a);
        setEinstellungen(e);
        setLogoUrl(
          e.logoPfad ? await signierteLogoUrl(supabase, e.logoPfad) : null,
        );
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
    angebote.forEach((a) =>
      items.push({
        id: `a-${a.id}`,
        text: `Angebot „${a.nummer}“ erstellt`,
        typ: "angebot",
        zeit: a.erstelltAm,
      }),
    );
    return items
      .sort((a, b) => b.zeit.localeCompare(a.zeit))
      .slice(0, 8);
  }, [kunden, projekte, dateien, angebote]);

  const wert = React.useMemo<DataContextWert>(() => {
    const getKunde = (id: string) => kunden.find((k) => k.id === id);

    return {
      geladen,
      kunden,
      projekte,
      dateien,
      aktivitaeten,
      einstellungen,
      logoUrl,
      firmendaten: einstellungen.firma,

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
        setAngebote((prev) =>
          prev.filter((a) => !projektIds.includes(a.projektId)),
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
        setAngebote((prev) => prev.filter((a) => a.projektId !== id));
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

      angebote,

      getAngebot: (id) => angebote.find((a) => a.id === id),

      getAngeboteVonProjekt: (projektId) =>
        angebote.filter((a) => a.projektId === projektId),

      angebotErstellenKi: async (projektId) => {
        const res = await fetch("/api/angebote/generieren", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projektId }),
        });
        const daten = await res.json().catch(() => null);
        if (!res.ok || !daten?.angebot) {
          throw new Error(daten?.error ?? "Angebotserstellung fehlgeschlagen.");
        }
        const angebot = daten.angebot as Angebot;
        setAngebote((prev) => [angebot, ...prev]);
        return angebot;
      },

      angebotAktualisieren: async (id, patch) => {
        const angebot = await aktualisiereAngebot(supabase, id, patch);
        setAngebote((prev) => prev.map((a) => (a.id === id ? angebot : a)));
      },

      angebotLoeschen: async (id) => {
        await loescheAngebot(supabase, id);
        setAngebote((prev) => prev.filter((a) => a.id !== id));
      },

      einstellungenSpeichern: async (daten) => {
        if (!userId) throw new Error("Nicht angemeldet");
        const gespeichert = await speichereEinstellungen(
          supabase,
          userId,
          daten,
        );
        setEinstellungen(gespeichert);
      },

      logoHochladen: async (datei, name) => {
        if (!userId) throw new Error("Nicht angemeldet");
        const alterPfad = einstellungen.logoPfad;
        const pfad = await ladeLogoHoch(supabase, userId, datei, name);
        await speichereLogoPfad(supabase, userId, pfad);
        if (alterPfad && alterPfad !== pfad) {
          await loescheLogo(supabase, alterPfad);
        }
        setEinstellungen((prev) => ({ ...prev, logoPfad: pfad }));
        setLogoUrl(await signierteLogoUrl(supabase, pfad));
      },

      logoLoeschen: async () => {
        if (!userId) throw new Error("Nicht angemeldet");
        const pfad = einstellungen.logoPfad;
        await speichereLogoPfad(supabase, userId, null);
        if (pfad) await loescheLogo(supabase, pfad);
        setEinstellungen((prev) => ({ ...prev, logoPfad: null }));
        setLogoUrl(null);
      },
    };
  }, [
    supabase,
    userId,
    geladen,
    kunden,
    projekte,
    dateien,
    angebote,
    aktivitaeten,
    einstellungen,
    logoUrl,
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
