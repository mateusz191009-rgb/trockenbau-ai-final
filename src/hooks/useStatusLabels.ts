"use client";

import { useTranslations } from "next-intl";
import type { AngebotStatus, DateiTyp, ProjektStatus } from "@/types";

export function useStatusLabels() {
  const tStatus = useTranslations("status");
  const tFileTypes = useTranslations("fileTypes");
  const tOfferStatus = useTranslations("angebote.status");

  return {
    projektStatusLabel: (status: ProjektStatus) => tStatus(status),
    dateiTypLabel: (typ: DateiTyp) => tFileTypes(typ),
    angebotStatusLabel: (status: AngebotStatus) => tOfferStatus(status),
  };
}
