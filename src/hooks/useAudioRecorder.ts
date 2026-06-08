"use client";

import * as React from "react";

interface AudioRecorderErgebnis {
  unterstuetzt: boolean;
  laeuft: boolean;
  dauer: number; // Sekunden
  fehler: string | null;
  starten: () => Promise<void>;
  stoppen: () => void;
  abbrechen: () => void;
}

/**
 * Sprachaufnahme über die Mikrofon-API des Browsers (wie bei WhatsApp).
 * Liefert die fertige Aufnahme als Blob an `onFertig`.
 */
export function useAudioRecorder(
  onFertig: (blob: Blob) => void,
): AudioRecorderErgebnis {
  const [laeuft, setLaeuft] = React.useState(false);
  const [dauer, setDauer] = React.useState(0);
  const [fehler, setFehler] = React.useState<string | null>(null);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const abgebrochenRef = React.useRef(false);

  const unterstuetzt =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof window.MediaRecorder !== "undefined";

  const aufraeumen = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  React.useEffect(() => () => aufraeumen(), [aufraeumen]);

  const starten = React.useCallback(async () => {
    setFehler(null);
    if (!unterstuetzt) {
      setFehler("Aufnahme wird von diesem Gerät nicht unterstützt.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      abgebrochenRef.current = false;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        if (!abgebrochenRef.current && chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          onFertig(blob);
        }
        aufraeumen();
        setLaeuft(false);
        setDauer(0);
      };

      recorder.start();
      recorderRef.current = recorder;
      setLaeuft(true);
      setDauer(0);
      timerRef.current = setInterval(() => setDauer((d) => d + 1), 1000);
    } catch {
      setFehler("Kein Zugriff auf das Mikrofon. Bitte Berechtigung erlauben.");
      aufraeumen();
    }
  }, [unterstuetzt, onFertig, aufraeumen]);

  const stoppen = React.useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const abbrechen = React.useCallback(() => {
    abgebrochenRef.current = true;
    stoppen();
  }, [stoppen]);

  return { unterstuetzt, laeuft, dauer, fehler, starten, stoppen, abbrechen };
}

/** Wandelt einen Blob/File in eine Base64-Data-URL um. */
export function dateiZuDataUrl(datei: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
    reader.readAsDataURL(datei);
  });
}
