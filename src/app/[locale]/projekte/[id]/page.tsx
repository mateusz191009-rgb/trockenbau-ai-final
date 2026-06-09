"use client";

import * as React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  MapPin,
  FileText,
  Ruler,
  FolderOpen,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProjektForm } from "@/components/projekte/ProjektForm";
import { DateiUpload } from "@/components/dateien/DateiUpload";
import { DateiListe } from "@/components/dateien/DateiListe";
import { useData } from "@/store/DataContext";
import { projektStatusMeta, projektStatusReihenfolge } from "@/lib/status";
import { cn, formatDatumKurz } from "@/lib/utils";
import type { ProjektStatus } from "@/types";

export default function ProjektDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    geladen,
    getProjekt,
    kundenName,
    projektAktualisieren,
    projektLoeschen,
    getDateienVonProjekt,
  } = useData();

  const projekt = getProjekt(params.id);

  const [formOffen, setFormOffen] = React.useState(false);
  const [loeschenOffen, setLoeschenOffen] = React.useState(false);

  // Lokale Eingaben (werden beim Verlassen des Feldes gespeichert).
  const [beschreibung, setBeschreibung] = React.useState("");
  const [notizen, setNotizen] = React.useState("");
  const [masse, setMasse] = React.useState({
    wandflaeche: "",
    deckenflaeche: "",
    raumhoehe: "",
    sonstige: "",
  });

  React.useEffect(() => {
    if (projekt) {
      setBeschreibung(projekt.beschreibung);
      setNotizen(projekt.notizen);
      setMasse(projekt.masse);
    }
    // Nur bei Wechsel des Projekts neu setzen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projekt?.id]);

  if (!geladen) {
    return <p className="py-20 text-center text-slate-400">Lädt…</p>;
  }

  if (!projekt) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="Baustelle nicht gefunden"
          description="Dieses Projekt existiert nicht (mehr)."
          action={
            <Link href="/projekte">
              <Button size="lg">Zurück zur Übersicht</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const dateien = getDateienVonProjekt(projekt.id);

  const speichereMasse = (feld: keyof typeof masse) =>
    projektAktualisieren(projekt.id, {
      masse: { ...masse, [feld]: masse[feld] },
    });

  return (
    <div className="space-y-6">
      {/* Zurück */}
      <Link
        href="/projekte"
        className="inline-flex items-center gap-2 text-base font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        Alle Projekte
      </Link>

      {/* Kopf */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {projekt.projektname}
            </h1>
            <div className="mt-3 space-y-1.5 text-base text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-400" />
                {kundenName(projekt.kundeId)}
              </p>
              {projekt.baustellenadresse ? (
                <p className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  {projekt.baustellenadresse}
                </p>
              ) : null}
              {projekt.startdatum ? (
                <p className="text-sm">
                  Start: {formatDatumKurz(projekt.startdatum)}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setFormOffen(true)}
            >
              <Pencil className="h-5 w-5" />
              Bearbeiten
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Löschen"
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => setLoeschenOffen(true)}
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Status schnell ändern */}
        <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
          <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {projektStatusReihenfolge.map((s) => {
              const aktiv = projekt.status === s;
              return (
                <button
                  key={s}
                  onClick={() =>
                    projektAktualisieren(projekt.id, { status: s as ProjektStatus })
                  }
                  className={cn(
                    "rounded-full px-4 py-2 text-base font-semibold transition-colors",
                    aktiv
                      ? "bg-brand-500 text-white"
                      : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  {projektStatusMeta[s].label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Abschnitt 1: Beschreibung */}
      <SektionKarte icon={FileText} titel="Beschreibung">
        <Textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          onBlur={() => projektAktualisieren(projekt.id, { beschreibung })}
          rows={4}
          placeholder="Was soll auf dieser Baustelle gemacht werden?"
        />
        <p className="mt-2 text-sm text-slate-400">
          Wird automatisch gespeichert.
        </p>
      </SektionKarte>

      {/* Abschnitt 2: Maße */}
      <SektionKarte icon={Ruler} titel="Maße">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Wandfläche (m²)">
            <Input
              inputMode="decimal"
              value={masse.wandflaeche}
              onChange={(e) =>
                setMasse((m) => ({ ...m, wandflaeche: e.target.value }))
              }
              onBlur={() => speichereMasse("wandflaeche")}
              placeholder="z. B. 180"
            />
          </Field>
          <Field label="Deckenfläche (m²)">
            <Input
              inputMode="decimal"
              value={masse.deckenflaeche}
              onChange={(e) =>
                setMasse((m) => ({ ...m, deckenflaeche: e.target.value }))
              }
              onBlur={() => speichereMasse("deckenflaeche")}
              placeholder="z. B. 95"
            />
          </Field>
          <Field label="Raumhöhe (m)">
            <Input
              inputMode="decimal"
              value={masse.raumhoehe}
              onChange={(e) =>
                setMasse((m) => ({ ...m, raumhoehe: e.target.value }))
              }
              onBlur={() => speichereMasse("raumhoehe")}
              placeholder="z. B. 2,80"
            />
          </Field>
          <Field label="Sonstige Maße">
            <Input
              value={masse.sonstige}
              onChange={(e) =>
                setMasse((m) => ({ ...m, sonstige: e.target.value }))
              }
              onBlur={() => speichereMasse("sonstige")}
              placeholder="z. B. 3 Türöffnungen"
            />
          </Field>
        </div>
      </SektionKarte>

      {/* Abschnitt 3: Dateien */}
      <SektionKarte
        icon={FolderOpen}
        titel="Dateien"
        zusatz={`${dateien.length} ${dateien.length === 1 ? "Datei" : "Dateien"}`}
      >
        <DateiUpload projektId={projekt.id} />
        {dateien.length > 0 ? (
          <div className="mt-6">
            <DateiListe dateien={dateien} />
          </div>
        ) : null}
      </SektionKarte>

      {/* Abschnitt 4: Notizen */}
      <SektionKarte icon={StickyNote} titel="Notizen">
        <Textarea
          value={notizen}
          onChange={(e) => setNotizen(e.target.value)}
          onBlur={() => projektAktualisieren(projekt.id, { notizen })}
          rows={4}
          placeholder="Eigene Notizen zur Baustelle…"
        />
        <p className="mt-2 text-sm text-slate-400">
          Wird automatisch gespeichert.
        </p>
      </SektionKarte>

      <ProjektForm
        open={formOffen}
        onClose={() => setFormOffen(false)}
        projekt={projekt}
      />

      <ConfirmDialog
        open={loeschenOffen}
        title="Baustelle löschen?"
        message={`„${projekt.projektname}“ und alle zugehörigen Dateien werden gelöscht.`}
        onCancel={() => setLoeschenOffen(false)}
        onConfirm={() => {
          projektLoeschen(projekt.id);
          router.push("/projekte");
        }}
      />
    </div>
  );
}

function SektionKarte({
  icon: Icon,
  titel,
  zusatz,
  children,
}: {
  icon: typeof FileText;
  titel: string;
  zusatz?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            <Icon className="h-5 w-5" />
          </span>
          {titel}
        </CardTitle>
        {zusatz ? (
          <span className="text-sm font-medium text-slate-400">{zusatz}</span>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
