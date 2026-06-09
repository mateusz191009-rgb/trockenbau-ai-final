"use client";

import { useTranslations } from "next-intl";
import type { DateiTyp, ProjektStatus } from "@/types";

export function useStatusLabels() {
  const tStatus = useTranslations("status");
  const tFileTypes = useTranslations("fileTypes");

  return {
    projektStatusLabel: (status: ProjektStatus) => tStatus(status),
    dateiTypLabel: (typ: DateiTyp) => tFileTypes(typ),
  };
}
