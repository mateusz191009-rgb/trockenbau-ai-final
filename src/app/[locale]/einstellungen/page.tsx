"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Building2,
  UserCircle,
  Check,
  LogOut,
  Image as ImageIcon,
  Calculator,
  FileText,
  Receipt,
  Sparkles,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";
import { useAuth } from "@/store/AuthContext";
import { naechsteAngebotsnummerVorschau, naechsteRechnungsnummerVorschau } from "@/lib/ki";
import type { Einstellungen } from "@/types";
import { cn } from "@/lib/utils";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/** Wandelt eine Eingabe in eine Zahl (akzeptiert Komma als Dezimaltrenner). */
function zahl(value: string): number {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function ganzzahl(value: string): number {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Großer Schalter für die KI-Optionen. */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left text-base font-semibold transition-colors",
        checked
          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-600",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
            checked ? "left-6" : "left-1",
          )}
        />
      </span>
    </button>
  );
}

/** Karte mit Icon-Titel — einheitlicher Rahmen für alle Abschnitte. */
function SectionCard({
  icon: Icon,
  title,
  description,
  accent = "brand",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  accent?: "brand" | "slate";
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                accent === "brand"
                  ? "bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-1">{description}</CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function EinstellungenPage() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const ts = useTranslations("sidebar");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const router = useRouter();
  const { user, abmelden } = useAuth();
  const {
    einstellungen,
    logoUrl,
    einstellungenSpeichern,
    logoHochladen,
    logoLoeschen,
  } = useData();

  const [werte, setWerte] = React.useState<Einstellungen>(einstellungen);
  const [gespeichert, setGespeichert] = React.useState(false);
  const [speichert, setSpeichert] = React.useState(false);
  const [fehler, setFehler] = React.useState<string | null>(null);

  const [logoLaedt, setLogoLaedt] = React.useState(false);
  const [logoHinweis, setLogoHinweis] = React.useState<string | null>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setWerte(einstellungen), [einstellungen]);

  const setFirma = (patch: Partial<Einstellungen["firma"]>) =>
    setWerte((w) => ({ ...w, firma: { ...w.firma, ...patch } }));
  const setKalk = (patch: Partial<Einstellungen["kalkulation"]>) =>
    setWerte((w) => ({ ...w, kalkulation: { ...w.kalkulation, ...patch } }));
  const setAngebot = (patch: Partial<Einstellungen["angebot"]>) =>
    setWerte((w) => ({ ...w, angebot: { ...w.angebot, ...patch } }));
  const setRechnung = (patch: Partial<Einstellungen["rechnung"]>) =>
    setWerte((w) => ({ ...w, rechnung: { ...w.rechnung, ...patch } }));
  const setKi = (patch: Partial<Einstellungen["ki"]>) =>
    setWerte((w) => ({ ...w, ki: { ...w.ki, ...patch } }));

  const speichern = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpeichert(true);
    setFehler(null);
    try {
      await einstellungenSpeichern(werte);
      setGespeichert(true);
      window.setTimeout(() => setGespeichert(false), 2500);
    } catch (err) {
      console.error(err);
      setFehler(tc("saveFailed"));
    } finally {
      setSpeichert(false);
    }
  };

  const logoWaehlen = async (datei: File) => {
    if (datei.size > MAX_LOGO_BYTES) {
      setLogoHinweis(t("logoTooLarge"));
      return;
    }
    setLogoLaedt(true);
    setLogoHinweis(null);
    try {
      await logoHochladen(datei, datei.name);
    } catch (err) {
      console.error(err);
      setLogoHinweis(t("logoError"));
    } finally {
      setLogoLaedt(false);
    }
  };

  const logoEntfernen = async () => {
    setLogoLaedt(true);
    setLogoHinweis(null);
    try {
      await logoLoeschen();
    } catch (err) {
      console.error(err);
      setLogoHinweis(t("logoError"));
    } finally {
      setLogoLaedt(false);
    }
  };

  const ausloggen = async () => {
    await abmelden();
    router.push("/login");
    router.refresh();
  };

  const themen = [
    { value: "light", label: t("light"), icon: Sun },
    { value: "dark", label: t("dark"), icon: Moon },
    { value: "system", label: t("system"), icon: Monitor },
  ];

  const speichernButton = (
    <div className="flex items-center gap-3">
      <Button size="lg" type="submit" disabled={speichert}>
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
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      {/* Darstellung */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg">{t("appearance")}</CardTitle>
            <CardDescription>{t("appearanceDesc")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {themen.map((th) => {
              const Icon = th.icon;
              const aktiv = mounted && theme === th.value;
              return (
                <button
                  key={th.value}
                  onClick={() => setTheme(th.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-base font-semibold transition-colors",
                    aktiv
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {th.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={speichern} className="space-y-6">
        {/* Firmendaten */}
        <SectionCard
          icon={Building2}
          title={t("companySection")}
          description={t("companySectionDesc")}
        >
          <div className="space-y-5">
            <Field label={tc("companyName")} htmlFor="firmenname">
              <Input
                id="firmenname"
                value={werte.firma.firmenname}
                onChange={(e) => setFirma({ firmenname: e.target.value })}
                placeholder={t("companyPlaceholder")}
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label={t("owner")} htmlFor="inhaber">
                <Input
                  id="inhaber"
                  value={werte.firma.inhaber}
                  onChange={(e) => setFirma({ inhaber: e.target.value })}
                />
              </Field>
              <Field label={t("contactPerson")} htmlFor="ansprechpartner">
                <Input
                  id="ansprechpartner"
                  value={werte.firma.ansprechpartner}
                  onChange={(e) =>
                    setFirma({ ansprechpartner: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field label={t("street")} htmlFor="strasse">
                  <Input
                    id="strasse"
                    value={werte.firma.strasse}
                    onChange={(e) => setFirma({ strasse: e.target.value })}
                  />
                </Field>
              </div>
              <Field label={t("houseNumber")} htmlFor="hausnummer">
                <Input
                  id="hausnummer"
                  value={werte.firma.hausnummer}
                  onChange={(e) => setFirma({ hausnummer: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label={t("zip")} htmlFor="plz">
                <Input
                  id="plz"
                  value={werte.firma.plz}
                  onChange={(e) => setFirma({ plz: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t("city")} htmlFor="ort">
                  <Input
                    id="ort"
                    value={werte.firma.ort}
                    onChange={(e) => setFirma({ ort: e.target.value })}
                  />
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label={tc("phone")} htmlFor="telefon">
                <Input
                  id="telefon"
                  type="tel"
                  value={werte.firma.telefon}
                  onChange={(e) => setFirma({ telefon: e.target.value })}
                  placeholder="089 1234567"
                />
              </Field>
              <Field label={t("mobile")} htmlFor="mobil">
                <Input
                  id="mobil"
                  type="tel"
                  value={werte.firma.mobil}
                  onChange={(e) => setFirma({ mobil: e.target.value })}
                  placeholder="0151 12345678"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label={tc("email")} htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={werte.firma.email}
                  onChange={(e) => setFirma({ email: e.target.value })}
                  placeholder="info@firma.de"
                />
              </Field>
              <Field label={t("website")} htmlFor="website">
                <Input
                  id="website"
                  value={werte.firma.website}
                  onChange={(e) => setFirma({ website: e.target.value })}
                  placeholder="www.firma.de"
                />
              </Field>
            </div>
            <Field label={t("vatId")} htmlFor="ustId">
              <Input
                id="ustId"
                value={werte.firma.ustId}
                onChange={(e) => setFirma({ ustId: e.target.value })}
                placeholder="DE123456789"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Firmenlogo */}
        <SectionCard
          icon={ImageIcon}
          title={t("logoSection")}
          description={t("logoSectionDesc")}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-32 w-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              {logoLaedt ? (
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              ) : logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={t("logoPreview")}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="flex flex-col items-center gap-1 text-slate-400">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">{t("noLogo")}</span>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  disabled={logoLaedt}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5" />
                  {logoUrl ? t("logoReplace") : t("logoUpload")}
                </Button>
                {logoUrl ? (
                  <Button
                    type="button"
                    size="lg"
                    variant="danger"
                    disabled={logoLaedt}
                    onClick={logoEntfernen}
                  >
                    <Trash2 className="h-5 w-5" />
                    {t("logoDelete")}
                  </Button>
                ) : null}
              </div>
              <p className="text-sm text-slate-400">{t("logoHint")}</p>
              {logoHinweis ? (
                <p className="text-base text-amber-600 dark:text-amber-400">
                  {logoHinweis}
                </p>
              ) : null}
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) logoWaehlen(f);
                e.target.value = "";
              }}
            />
          </div>
        </SectionCard>

        {/* Kalkulation */}
        <SectionCard
          icon={Calculator}
          title={t("calcSection")}
          description={t("calcSectionDesc")}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label={t("hourlyRate")} htmlFor="stundenlohn">
              <Input
                id="stundenlohn"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={werte.kalkulation.stundenlohn}
                onChange={(e) => setKalk({ stundenlohn: zahl(e.target.value) })}
              />
            </Field>
            <Field label={t("materialSurcharge")} htmlFor="materialaufschlag">
              <Input
                id="materialaufschlag"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={werte.kalkulation.materialaufschlag}
                onChange={(e) =>
                  setKalk({ materialaufschlag: zahl(e.target.value) })
                }
              />
            </Field>
            <Field label={t("profitMargin")} htmlFor="gewinnmarge">
              <Input
                id="gewinnmarge"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={werte.kalkulation.gewinnmarge}
                onChange={(e) => setKalk({ gewinnmarge: zahl(e.target.value) })}
              />
            </Field>
            <Field label={t("travelCostPerKm")} htmlFor="fahrtkosten">
              <Input
                id="fahrtkosten"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={werte.kalkulation.fahrtkostenProKm}
                onChange={(e) =>
                  setKalk({ fahrtkostenProKm: zahl(e.target.value) })
                }
              />
            </Field>
            <Field label={t("minTravel")} htmlFor="mindestanfahrt">
              <Input
                id="mindestanfahrt"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={werte.kalkulation.mindestanfahrt}
                onChange={(e) =>
                  setKalk({ mindestanfahrt: zahl(e.target.value) })
                }
              />
            </Field>
            <Field label={t("disposalFlat")} htmlFor="entsorgung">
              <Input
                id="entsorgung"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={werte.kalkulation.entsorgungspauschale}
                onChange={(e) =>
                  setKalk({ entsorgungspauschale: zahl(e.target.value) })
                }
              />
            </Field>
            <Field label={t("vat")} htmlFor="mwst">
              <Input
                id="mwst"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={werte.kalkulation.mehrwertsteuer}
                onChange={(e) =>
                  setKalk({ mehrwertsteuer: zahl(e.target.value) })
                }
              />
            </Field>
          </div>
        </SectionCard>

        {/* Angebote */}
        <SectionCard
          icon={FileText}
          title={t("offerSection")}
          description={t("offerSectionDesc")}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label={t("offerPrefix")}
              htmlFor="angebotPraefix"
              hint={`${t("nextNumberPreview")}: ${naechsteAngebotsnummerVorschau(werte)}`}
            >
              <Input
                id="angebotPraefix"
                value={werte.angebot.praefix}
                onChange={(e) => setAngebot({ praefix: e.target.value })}
                placeholder="ANG-2026-"
              />
            </Field>
            <Field label={t("offerNumber")} htmlFor="angebotNummer">
              <Input
                id="angebotNummer"
                type="number"
                inputMode="numeric"
                min="1"
                value={werte.angebot.aktuelleNummer}
                onChange={(e) =>
                  setAngebot({ aktuelleNummer: ganzzahl(e.target.value) })
                }
              />
            </Field>
            <Field label={t("paymentTerm")} htmlFor="angebotZahlungsziel">
              <Input
                id="angebotZahlungsziel"
                type="number"
                inputMode="numeric"
                min="0"
                value={werte.angebot.zahlungsziel}
                onChange={(e) =>
                  setAngebot({ zahlungsziel: ganzzahl(e.target.value) })
                }
              />
            </Field>
            <Field label={t("offerValidity")} htmlFor="angebotGueltigkeit">
              <Input
                id="angebotGueltigkeit"
                type="number"
                inputMode="numeric"
                min="0"
                value={werte.angebot.gueltigkeit}
                onChange={(e) =>
                  setAngebot({ gueltigkeit: ganzzahl(e.target.value) })
                }
              />
            </Field>
          </div>
        </SectionCard>

        {/* Rechnungen */}
        <SectionCard
          icon={Receipt}
          title={t("invoiceSection")}
          description={t("invoiceSectionDesc")}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label={t("invoicePrefix")}
                htmlFor="rechnungPraefix"
                hint={`${t("nextNumberPreview")}: ${naechsteRechnungsnummerVorschau(werte)}`}
              >
                <Input
                  id="rechnungPraefix"
                  value={werte.rechnung.praefix}
                  onChange={(e) => setRechnung({ praefix: e.target.value })}
                  placeholder="RE-2026-"
                />
              </Field>
              <Field label={t("invoiceNumber")} htmlFor="rechnungNummer">
                <Input
                  id="rechnungNummer"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={werte.rechnung.aktuelleNummer}
                  onChange={(e) =>
                    setRechnung({ aktuelleNummer: ganzzahl(e.target.value) })
                  }
                />
              </Field>
              <Field
                label={t("invoicePaymentTerm")}
                htmlFor="rechnungZahlungsziel"
              >
                <Input
                  id="rechnungZahlungsziel"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={werte.rechnung.zahlungsziel}
                  onChange={(e) =>
                    setRechnung({ zahlungsziel: ganzzahl(e.target.value) })
                  }
                />
              </Field>
              <Field label={t("bankName")} htmlFor="bankname">
                <Input
                  id="bankname"
                  value={werte.rechnung.bankname}
                  onChange={(e) => setRechnung({ bankname: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label={t("iban")} htmlFor="iban">
                <Input
                  id="iban"
                  value={werte.rechnung.iban}
                  onChange={(e) => setRechnung({ iban: e.target.value })}
                  placeholder="DE00 0000 0000 0000 0000 00"
                />
              </Field>
              <Field label={t("bic")} htmlFor="bic">
                <Input
                  id="bic"
                  value={werte.rechnung.bic}
                  onChange={(e) => setRechnung({ bic: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* KI-Vorbereitung */}
        <SectionCard
          icon={Sparkles}
          title={t("aiSection")}
          description={t("aiSectionDesc")}
        >
          <div className="space-y-3">
            <Toggle
              label={t("aiMaterial")}
              checked={werte.ki.materialSchaetzen}
              onChange={(v) => setKi({ materialSchaetzen: v })}
            />
            <Toggle
              label={t("aiHours")}
              checked={werte.ki.arbeitsstundenSchaetzen}
              onChange={(v) => setKi({ arbeitsstundenSchaetzen: v })}
            />
            <Toggle
              label={t("aiPrices")}
              checked={werte.ki.preiseVorschlagen}
              onChange={(v) => setKi({ preiseVorschlagen: v })}
            />
          </div>
        </SectionCard>

        <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          {speichernButton}
        </div>
      </form>

      {/* Konto */}
      <SectionCard icon={UserCircle} title={t("account")} accent="slate">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">{t("signedInAs")}</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {user?.email ?? "—"}
            </p>
          </div>
          <Button
            variant="danger"
            size="lg"
            className="w-full sm:w-auto"
            onClick={ausloggen}
          >
            <LogOut className="h-5 w-5" />
            {ts("logout")}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
