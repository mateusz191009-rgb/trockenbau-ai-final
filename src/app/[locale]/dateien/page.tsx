import { redirect } from "@/i18n/navigation";

/** Globale Dateiübersicht — Dateien sind pro Baustelle erreichbar. */
export default function DateienPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: "/projekte", locale });
}
