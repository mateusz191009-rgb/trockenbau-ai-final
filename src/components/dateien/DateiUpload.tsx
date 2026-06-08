"use client";

import * as React from "react";
import { Mic, Square, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";
import { useAudioRecorder, dateiZuDataUrl } from "@/hooks/useAudioRecorder";
import { erkenneDateiTyp } from "@/lib/status";
import { cn } from "@/lib/utils";

interface DateiUploadProps {
  projektId: string;
}

// Großzügiges Limit, damit der lokale Speicher (localStorage) nicht überläuft.
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function DateiUpload({ projektId }: DateiUploadProps) {
  const { dateiHinzufuegen } = useData();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [laedt, setLaedt] = React.useState(false);
  const [hinweis, setHinweis] = React.useState<string | null>(null);
  const [ueberzogen, setUeberzogen] = React.useState(false);

  const speichereBlob = React.useCallback(
    async (datei: Blob, name: string) => {
      if (datei.size > MAX_BYTES) {
        setHinweis(
          `„${name}“ ist zu groß (max. 8 MB). Bitte kleinere Datei wählen.`,
        );
        return;
      }
      const dataUrl = await dateiZuDataUrl(datei);
      dateiHinzufuegen({
        projektId,
        name,
        typ: erkenneDateiTyp(datei.type, name),
        mimeType: datei.type || "application/octet-stream",
        groesse: datei.size,
        dataUrl,
      });
    },
    [dateiHinzufuegen, projektId],
  );

  const verarbeite = React.useCallback(
    async (dateien: FileList | File[]) => {
      setLaedt(true);
      setHinweis(null);
      try {
        for (const f of Array.from(dateien)) {
          await speichereBlob(f, f.name);
        }
      } catch {
        setHinweis("Beim Speichern ist ein Fehler aufgetreten.");
      } finally {
        setLaedt(false);
      }
    },
    [speichereBlob],
  );

  const recorder = useAudioRecorder(async (blob) => {
    setLaedt(true);
    try {
      const name = `Sprachnachricht ${new Date().toLocaleString("de-DE")}.webm`;
      await speichereBlob(blob, name);
    } finally {
      setLaedt(false);
    }
  });

  return (
    <div className="space-y-4">
      {/* Drag & Drop / Klick-Fläche */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setUeberzogen(true);
        }}
        onDragLeave={() => setUeberzogen(false)}
        onDrop={(e) => {
          e.preventDefault();
          setUeberzogen(false);
          if (e.dataTransfer.files.length) verarbeite(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          ueberzogen
            ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
            : "border-slate-300 hover:border-brand-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50",
        )}
      >
        {laedt ? (
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            <Upload className="h-7 w-7" />
          </span>
        )}
        <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          Dateien hochladen
        </p>
        <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
          Bilder, PDFs oder Grundrisse hierher ziehen oder tippen
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,audio/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) verarbeite(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Sprachnachricht aufnehmen */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-5 w-5" />
          Datei auswählen
        </Button>

        {!recorder.laeuft ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={recorder.starten}
            disabled={!recorder.unterstuetzt}
          >
            <Mic className="h-5 w-5" />
            Sprachnachricht aufnehmen
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            variant="danger"
            className="flex-1"
            onClick={recorder.stoppen}
          >
            <Square className="h-5 w-5 fill-current" />
            Aufnahme stoppen ({recorder.dauer}s)
          </Button>
        )}
      </div>

      {recorder.laeuft ? (
        <p className="flex items-center gap-2 text-base font-medium text-red-600 dark:text-red-400">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          Aufnahme läuft… ({recorder.dauer} Sekunden)
        </p>
      ) : null}

      {recorder.fehler ? (
        <p className="text-base text-red-600 dark:text-red-400">
          {recorder.fehler}
        </p>
      ) : null}

      {hinweis ? (
        <p className="text-base text-amber-600 dark:text-amber-400">{hinweis}</p>
      ) : null}
    </div>
  );
}
