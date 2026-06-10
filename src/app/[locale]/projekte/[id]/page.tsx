"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  Sparkles,
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
import { ProjektAngebote } from "@/components/angebote/ProjektAngebote";
import { useData } from "@/store/DataContext";
import { formatDatumKurz } from "@/lib/utils";

export default function ProjektDetailPage() {
  const t = useTranslations("projectDetail");
  const tp = useTranslations("projects");
  const tc = useTranslations("common");
  const ta = useTranslations("angebote");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projekt?.id]);

  if (!geladen) {
    return <p className="py-20 text-center text-slate-400">{tc("loading")}</p>;
  }

  if (!projekt) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title={t("notFound")}
          description={t("notFoundDesc")}
          action={
            <Link href="/projekte">
              <Button size="lg">{t("backToList")}</Button>
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
      <Link
        href="/projekte"
        className="inline-flex items-center gap-2 text-base font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        {t("allProjects")}
      </Link>

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
                  {tc("start")} {formatDatumKurz(projekt.startdatum)}
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
              {tc("edit")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={tc("delete")}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => setLoeschenOffen(true)}
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </Card>

      <SektionKarte icon={FileText} titel={tc("description")}>
        <Textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          onBlur={() => projektAktualisieren(projekt.id, { beschreibung })}
          rows={4}
          placeholder={t("descriptionPlaceholder")}
        />
        <p className="mt-2 text-sm text-slate-400">{tc("autoSaved")}</p>
      </SektionKarte>

      <SektionKarte icon={Sparkles} titel={ta("sectionTitle")}>
        <ProjektAngebote projektId={projekt.id} />
      </SektionKarte>

      <SektionKarte icon={Ruler} titel={t("measurements")}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("wallArea")}>
            <Input
              inputMode="decimal"
              value={masse.wandflaeche}
              onChange={(e) =>
                setMasse((m) => ({ ...m, wandflaeche: e.target.value }))
              }
              onBlur={() => speichereMasse("wandflaeche")}
              placeholder={t("wallPlaceholder")}
            />
          </Field>
          <Field label={t("ceilingArea")}>
            <Input
              inputMode="decimal"
              value={masse.deckenflaeche}
              onChange={(e) =>
                setMasse((m) => ({ ...m, deckenflaeche: e.target.value }))
              }
              onBlur={() => speichereMasse("deckenflaeche")}
              placeholder={t("ceilingPlaceholder")}
            />
          </Field>
          <Field label={t("roomHeight")}>
            <Input
              inputMode="decimal"
              value={masse.raumhoehe}
              onChange={(e) =>
                setMasse((m) => ({ ...m, raumhoehe: e.target.value }))
              }
              onBlur={() => speichereMasse("raumhoehe")}
              placeholder={t("heightPlaceholder")}
            />
          </Field>
          <Field label={t("otherMeasurements")}>
            <Input
              value={masse.sonstige}
              onChange={(e) =>
                setMasse((m) => ({ ...m, sonstige: e.target.value }))
              }
              onBlur={() => speichereMasse("sonstige")}
              placeholder={t("otherPlaceholder")}
            />
          </Field>
        </div>
      </SektionKarte>

      <SektionKarte
        icon={FolderOpen}
        titel={tc("files")}
        zusatz={tc("fileCount", { count: dateien.length })}
      >
        <DateiUpload projektId={projekt.id} />
        {dateien.length > 0 ? (
          <div className="mt-6">
            <DateiListe dateien={dateien} />
          </div>
        ) : null}
      </SektionKarte>

      <SektionKarte icon={StickyNote} titel={tc("notes")}>
        <Textarea
          value={notizen}
          onChange={(e) => setNotizen(e.target.value)}
          onBlur={() => projektAktualisieren(projekt.id, { notizen })}
          rows={4}
          placeholder={t("notesPlaceholder")}
        />
        <p className="mt-2 text-sm text-slate-400">{tc("autoSaved")}</p>
      </SektionKarte>

      <ProjektForm
        open={formOffen}
        onClose={() => setFormOffen(false)}
        projekt={projekt}
      />

      <ConfirmDialog
        open={loeschenOffen}
        title={tp("deleteTitle")}
        message={t("deleteMessage", { name: projekt.projektname })}
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
