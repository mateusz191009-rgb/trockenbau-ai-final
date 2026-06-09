import { defineRouting } from "next-intl/routing";

export const locales = [
  "de",
  "pl",
  "ro",
  "tr",
  "ar",
  "uk",
  "ru",
  "sr",
] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  de: "Deutsch",
  pl: "Polski",
  ro: "Română",
  tr: "Türkçe",
  ar: "العربية",
  uk: "Українська",
  ru: "Русский",
  sr: "Srpski",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "de",
  localePrefix: "as-needed",
});
