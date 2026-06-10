"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  FileText,
  Trash2,
  Save,
  Sparkles,
  ClipboardList,
  ListChecks,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PositionenEditor } from "@/components/angebote/PositionenEditor";
import { AngebotPdf } from "@/components/angebote/AngebotPdf";
import type {
  AngebotPdfDaten,
  AngebotPdfLabels,
} from "@/components/angebote/AngebotPdf";
import { useData } from "@/store/DataContext";
import { berechneSummen, formatEuro, formatZahl } from "@/lib/angebot";
import { firmenadresse } from "@/lib/ki";
import { formatDatum } from "@/lib/utils";
import { angebotStatusReihenfolge } from "@/lib/status";
import type { AngebotPosition, AngebotStatus } from "@/types";

export default function AngebotEditorPage() {
  const t = useTranslations("angebote");
  const tp = useTranslations("angebote.pdf");
  const tc = useTranslations("common");
  const tStatus = useTranslations("angebote.status");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    geladen,
    getAngebot,
    getProjekt,
    getKunde,
    einstellungen,
    logoUrl,
    angebotAktualisieren,
    angebotLoeschen,
  } = useData();

  const angebot = getAngebot(params.id);

  const [titel, setTitel] = React.useState("");
  const [status, setStatus] = React.useState<AngebotStatus>("entwurf");
  const [zusammenfassung, setZusammenfassung] = React.useState("");
  const [leistung, setLeistung] = React.useState("");
  const [positionen, setPositionen] = React.useState<AngebotPosition[]>([]);
  const [zahlungsziel, setZahlungsziel] = React.useState(14);
  const [gueltigkeit, setGueltigkeit] = React.useState(30);
  const [notizen, setNotizen] = React.useState("");

  const [speichert, setSpeichert] = React.useState(false);
  const [gespeichert, setGespeichert] = React.useState(false);
  const [fehler, setFehler] = React.useState<string | null>(null);
  const [loeschenOffen, setLoeschenOffen] = React.useState(false);

  React.useEffect(() => {
    if (angebot) {
      setTitel(angebot.titel);
      setStatus(angebot.status);
      setZusammenfassung(angebot.zusammenfassung);
      setLeistung(angebot.leistungsbeschreibung);
      setPositionen(angebot.positionen);
      setZahlungsziel(angebot.zahlungsziel);
      setGueltigkeit(angebot.gueltigkeit);
      setNotizen(angebot.notizen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angebot?.id]);

  const projekt = angebot ? getProjekt(angebot.projektId) : undefined;
  const kunde = angebot ? getKunde(angebot.kundeId) : undefined;
  const mwstSatz = angebot?.mwstSatz ?? einstellungen.kalkulation.mehrwertsteuer;

  const ganzzahl = (v: string) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const pdfDaten = React.useMemo<AngebotPdfDaten | null>(() => {
    if (!angebot) return null;
    const f = einstellungen.firma;
    const summen = berechneSummen(positionen, mwstSatz);
    const firmaZeilen = [
      [f.strasse, f.hausnummer].filter(Boolean).join(" "),
      [f.plz, f.ort].filter(Boolean).join(" "),
    ].filter(Boolean);

    const kundeAdresse = (kunde?.adresse ?? "")
      .split(/\r?\n/)
      .map((z) => z.trim())
      .filter(Boolean);

    const safeLogo =
      logoUrl && !logoUrl.toLowerCase().includes(".svg") ? logoUrl : null;

    return {
      firma: {
        name: f.firmenname || firmenadresse(einstellungen) || tp("offer"),
        zeilen: firmaZeilen,
        telefon: f.telefon || f.mobil,
        email: f.email,
        website: f.website,
        ustId: f.ustId,
      },
      logoUrl: safeLogo,
      kunde: {
        name: kunde?.firmenname ?? "",
        ansprechpartner: kunde?.ansprechpartner ?? "",
        adresseZeilen: kundeAdresse,
      },
      baustelle: projekt?.baustellenadresse ?? "",
      nummer: angebot.nummer,
      datum: formatDatum(angebot.erstelltAm),
      titel,
      leistungsbeschreibung: leistung,
      positionen: positionen.map((p, i) => ({
        pos: i + 1,
        bezeichnung: p.bezeichnung,
        beschreibung: p.beschreibung,
        menge: formatZahl(p.menge),
        einheit: p.einheit,
        einzelpreis: formatEuro(p.einzelpreis),
        summe: formatEuro((p.menge || 0) * (p.einzelpreis || 0)),
      })),
      netto: formatEuro(summen.netto),
      mwstBetrag: formatEuro(summen.mwstBetrag),
      brutto: formatEuro(summen.brutto),
    };
  }, [
    angebot,
    einstellungen,
    kunde,
    projekt,
    logoUrl,
    titel,
    leistung,
    positionen,
    mwstSatz,
    tp,
  ]);

  const pdfLabels = React.useMemo<AngebotPdfLabels>(
    () => ({
      offer: tp("offer"),
      offerNumber: tp("offerNumber"),
      date: tp("date"),
      customer: tp("customer"),
      site: tp("site"),
      pos: tp("pos"),
      description: tp("description"),
      qty: tp("qty"),
      unit: tp("unit"),
      unitPrice: tp("unitPrice"),
      total: tp("total"),
      net: tp("net"),
      vat: tp("vat", { rate: mwstSatz }),
      gross: tp("gross"),
      serviceDescription: tp("serviceDescription"),
      paymentTerms: tp("paymentTerms"),
      paymentTermsText: tp("paymentTermsText", { days: zahlungsziel }),
      validityText: tp("validityText", { days: gueltigkeit }),
      thanks: tp("thanks"),
      vatId: tp("vatId"),
    }),
    [tp, mwstSatz, zahlungsziel, gueltigkeit],
  );

  if (!geladen) {
    return <p className="py-20 text-center text-slate-400">{tc("loading")}</p>;
  }

  if (!angebot) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title={t("notFound")}
          description={t("notFoundDesc")}
          action={
            <Link href="/angebote">
              <Button size="lg">{t("listTitle")}</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const speichern = async () => {
    setSpeichert(true);
    setFehler(null);
    try {
      await angebotAktualisieren(angebot.id, {
        titel,
        status,
        zusammenfassung,
        leistungsbeschreibung: leistung,
        positionen,
        zahlungsziel,
        gueltigkeit,
        notizen,
      });
      setGespeichert(true);
      window.setTimeout(() => setGespeichert(false), 2500);
    } catch (err) {
      console.error(err);
      setFehler(tc("saveFailed"));
    } finally {
      setSpeichert(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href={projekt ? `/projekte/${projekt.id}` : "/angebote"}
        className="inline-flex items-center gap-2 text-base font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        {projekt ? t("backToProject") : t("listTitle")}
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              {angebot.nummer}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {titel || t("untitled")}
            </h1>
            {projekt ? (
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                {projekt.projektname}
                {kunde ? ` · ${kunde.firmenname}` : ""}
              </p>
            ) : null}
          </div>
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
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("title")} htmlFor="titel">
          <Input
            id="titel"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
          />
        </Field>
        <Field label={t("statusLabel")} htmlFor="status">
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AngebotStatus)}
          >
            {angebotStatusReihenfolge.map((s) => (
              <option key={s} value={s}>
                {tStatus(s)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <SektionKarte icon={Sparkles} titel={t("summary")}>
        <Textarea
          value={zusammenfassung}
          onChange={(e) => setZusammenfassung(e.target.value)}
          rows={3}
        />
      </SektionKarte>

      <SektionKarte icon={ClipboardList} titel={t("serviceDescription")}>
        <Textarea
          value={leistung}
          onChange={(e) => setLeistung(e.target.value)}
          rows={5}
        />
      </SektionKarte>

      <SektionKarte
        icon={ListChecks}
        titel={t("positions")}
        zusatz={t("laborHours", { hours: formatZahl(angebot.arbeitsstunden) })}
      >
        <PositionenEditor
          positionen={positionen}
          mwstSatz={mwstSatz}
          onChange={setPositionen}
        />
      </SektionKarte>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("paymentTerm")} htmlFor="zahlungsziel">
          <Input
            id="zahlungsziel"
            type="number"
            inputMode="numeric"
            min="0"
            value={zahlungsziel}
            onChange={(e) => setZahlungsziel(ganzzahl(e.target.value))}
          />
        </Field>
        <Field label={t("validity")} htmlFor="gueltigkeit">
          <Input
            id="gueltigkeit"
            type="number"
            inputMode="numeric"
            min="0"
            value={gueltigkeit}
            onChange={(e) => setGueltigkeit(ganzzahl(e.target.value))}
          />
        </Field>
      </div>

      <SektionKarte icon={FileText} titel={t("notes")}>
        <Textarea
          value={notizen}
          onChange={(e) => setNotizen(e.target.value)}
          rows={3}
          placeholder={t("notesPlaceholder")}
        />
      </SektionKarte>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <Button size="lg" onClick={speichern} disabled={speichert}>
          <Save className="h-5 w-5" />
          {speichert ? tc("saving") : tc("save")}
        </Button>
        {gespeichert ? (
          <span className="flex items-center gap-1.5 text-base font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="h-5 w-5" />
            {t("saved")}
          </span>
        ) : null}
        {fehler ? (
          <span className="text-base font-medium text-red-600 dark:text-red-400">
            {fehler}
          </span>
        ) : null}
      </div>

      <SektionKarte icon={FileSignature} titel={t("pdfSection")}>
        {pdfDaten ? (
          <AngebotPdf
            daten={pdfDaten}
            labels={pdfLabels}
            fileName={`${angebot.nummer}.pdf`}
            ui={{
              downloadPdf: t("downloadPdf"),
              preparingPdf: t("preparingPdf"),
              showPreview: t("showPreview"),
              hidePreview: t("hidePreview"),
            }}
          />
        ) : null}
      </SektionKarte>

      <ConfirmDialog
        open={loeschenOffen}
        title={t("deleteTitle")}
        message={t("deleteMessage", { number: angebot.nummer })}
        onCancel={() => setLoeschenOffen(false)}
        onConfirm={async () => {
          const projektId = angebot.projektId;
          await angebotLoeschen(angebot.id);
          setLoeschenOffen(false);
          router.push(projektId ? `/projekte/${projektId}` : "/angebote");
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
