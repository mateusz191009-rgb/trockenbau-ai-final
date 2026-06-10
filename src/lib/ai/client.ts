import OpenAI from "openai";

/**
 * Zentrale OpenAI-Anbindung (nur serverseitig!).
 * Der API-Key kommt ausschließlich aus den Umgebungsvariablen und wird
 * niemals an den Client gesendet.
 */

let cached: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY fehlt. Bitte in .env.local eintragen (siehe .env.example).",
    );
  }
  if (!cached) {
    cached = new OpenAI({ apiKey });
  }
  return cached;
}

/**
 * Modell-Auswahl (per ENV überschreibbar). Standard sind die günstigen
 * gpt-4o-mini / whisper-1 Modelle — gut geeignet für ein knappes Budget:
 *  - Text & Vision: gpt-4o-mini (kann Bilder lesen, unterstützt JSON-Modus)
 *  - Audio:         whisper-1 (Transkription von Sprachnachrichten)
 */
export const MODELLE = {
  text: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
  vision: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
  transcribe: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
} as const;

/**
 * Ruft ein Chat-Modell im JSON-Modus auf und parst das Ergebnis.
 * Wirft einen Fehler, wenn keine gültige JSON-Antwort kommt.
 */
export async function chatJson<T>(params: {
  system: string;
  content: OpenAI.Chat.Completions.ChatCompletionContentPart[] | string;
  model?: string;
  temperature?: number;
}): Promise<T> {
  const client = getOpenAI();

  const completion = await client.chat.completions.create({
    model: params.model || MODELLE.text,
    temperature: params.temperature ?? 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.content },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Leere Antwort vom KI-Modell.");
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Die KI-Antwort war kein gültiges JSON.");
  }
}
