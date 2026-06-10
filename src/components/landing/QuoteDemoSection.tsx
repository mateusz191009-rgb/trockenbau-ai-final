"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  Calculator,
  Clock,
  FileText,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Upload,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/store/AuthContext";
import { cn } from "@/lib/utils";

type JobType = "residential" | "commercial" | "renovation";

const JOB_TYPES: JobType[] = ["residential", "commercial", "renovation"];
const MULTIPLIER: Record<JobType, number> = {
  residential: 0.95,
  commercial: 1.15,
  renovation: 1.05,
};

function berechne(
  auftragsumfang: number,
  materialEinbeziehen: boolean,
  auftragstyp: JobType,
  stundenlohn: number,
) {
  const m = MULTIPLIER[auftragstyp];
  const zusaetzlicherAufwand = materialEinbeziehen ? auftragsumfang * 0.35 : 0;
  const arbeitsstunden = (auftragsumfang * 0.07 + zusaetzlicherAufwand * 0.09) * m;
  const material = (auftragsumfang * 8 + zusaetzlicherAufwand * 6) * m;
  const arbeit = arbeitsstunden * stundenlohn;
  const gesamt = (arbeit + material) * 1.15;
  const manuellStd = Math.max(2, arbeitsstunden * 2.5);
  const kiMin = Math.max(3, Math.round(arbeitsstunden * 4));

  return { arbeitsstunden, material, arbeit, gesamt, manuellStd, kiMin };
}

function formatEuro(wert: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(wert);
}

function AnimZahl({ wert, format }: { wert: number; format: (n: number) => string }) {
  const [puls, setPuls] = React.useState(false);

  React.useEffect(() => {
    setPuls(true);
    const timer = window.setTimeout(() => setPuls(false), 400);
    return () => window.clearTimeout(timer);
  }, [wert]);

  return (
    <span
      className={cn(
        "tabular-nums transition-transform duration-300",
        puls && "scale-105 text-brand-600 dark:text-brand-400",
      )}
    >
      {format(wert)}
    </span>
  );
}

function GesperrteAktion({
  label,
  icon: Icon,
  variant = "outline",
  onFreigeschaltet,
  onGesperrt,
  eingeloggt,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "outline" | "primary";
  onFreigeschaltet: () => void;
  onGesperrt: () => void;
  eingeloggt: boolean;
}) {
  const t = useTranslations("landing.calculator");

  return (
    <button
      type="button"
      onClick={() => (eingeloggt ? onFreigeschaltet() : onGesperrt())}
      className={cn(
        "relative flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 px-5 py-4 text-base font-semibold transition-colors",
        variant === "primary"
          ? "border-brand-500 bg-brand-500 text-white hover:bg-brand-600"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        !eingeloggt && "opacity-90",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
      {!eingeloggt ? (
        <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Lock className="h-3 w-3" />
          {t("locked")}
        </span>
      ) : null}
    </button>
  );
}

export function QuoteDemoSection() {
  const t = useTranslations("landing.calculator");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [auftragsumfang, setAuftragsumfang] = React.useState(85);
  const [materialEinbeziehen, setMaterialEinbeziehen] = React.useState(true);
  const [auftragstyp, setAuftragstyp] = React.useState<JobType>("residential");
  const [stundenlohn, setStundenlohn] = React.useState(48);
  const [loginHinweis, setLoginHinweis] = React.useState(false);
  const uploadRef = React.useRef<HTMLInputElement>(null);

  const eingeloggt = !authLoading && !!user;

  React.useEffect(() => {
    if (eingeloggt) setLoginHinweis(false);
  }, [eingeloggt]);

  const zeigeLoginHinweis = () => setLoginHinweis(true);

  const { arbeitsstunden, material, arbeit, gesamt, manuellStd, kiMin } = berechne(
    auftragsumfang,
    materialEinbeziehen,
    auftragstyp,
    stundenlohn,
  );

  const euro = (n: number) => formatEuro(n, locale);

  return (
    <section
      id="demo"
      className="bg-gradient-to-b from-white to-brand-50/40 px-4 py-20 sm:px-6 sm:py-24 dark:from-slate-950 dark:to-brand-950/20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
            <Calculator className="h-4 w-4" />
            {t("badge")}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* Steuerung */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="auftragsumfang" className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {t("projectScope")}
                  </label>
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {t("projectScopeValue", { scope: auftragsumfang })}
                  </span>
                </div>
                <input
                  id="auftragsumfang"
                  type="range"
                  min={20}
                  max={250}
                  step={5}
                  value={auftragsumfang}
                  onChange={(e) => setAuftragsumfang(Number(e.target.value))}
                  className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-500 dark:bg-slate-700"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>20</span>
                  <span>250</span>
                </div>
              </div>

              <div>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  {t("jobType")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {JOB_TYPES.map((typ) => (
                    <button
                      key={typ}
                      type="button"
                      onClick={() => setAuftragstyp(typ)}
                      className={cn(
                        "rounded-2xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                        auftragstyp === typ
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                      )}
                    >
                      {t(`jobTypes.${typ}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="stundenlohn"
                  className="text-base font-semibold text-slate-800 dark:text-slate-200"
                >
                  {t("hourlyRate")}
                </label>
                <div className="relative mt-3">
                  <Input
                    id="stundenlohn"
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={200}
                    step={1}
                    value={stundenlohn}
                    onChange={(e) => {
                      const n = parseFloat(e.target.value.replace(",", "."));
                      setStundenlohn(Number.isFinite(n) && n > 0 ? n : 1);
                    }}
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    €/h
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMaterialEinbeziehen((d) => !d)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  {t("includeMaterials")}
                </span>
                {materialEinbeziehen ? (
                  <ToggleRight className="h-8 w-8 shrink-0 text-brand-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 shrink-0 text-slate-400" />
                )}
              </button>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    eingeloggt ? uploadRef.current?.click() : zeigeLoginHinweis()
                  }
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors",
                    eingeloggt
                      ? "border-brand-300 hover:border-brand-400 hover:bg-brand-50/50 dark:border-brand-800 dark:hover:bg-brand-500/5"
                      : "border-slate-300 hover:border-slate-400 dark:border-slate-600",
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {eingeloggt ? (
                      <Upload className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </span>
                  <span className="text-base font-semibold text-slate-700 dark:text-slate-200">
                    {t("uploadImage")}
                  </span>
                  <span className="text-sm text-slate-400">{t("uploadImageHint")}</span>
                </button>
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => router.push("/projekte")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("manualTime")}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-500 line-through decoration-red-400/60">
                    {t("manualTimeValue", { hours: Math.round(manuellStd) })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                    {t("withAi")}
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600 dark:text-brand-400">
                    {t("withAiValue", { minutes: kiMin })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live-Vorschau */}
          <div className="relative flex flex-col rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-500/10 via-white to-orange-50 p-6 shadow-card sm:p-8 dark:border-brand-800 dark:from-brand-500/5 dark:via-slate-900 dark:to-slate-900">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-semibold">{t("offerPreview")}</span>
            </div>

            <div className="mt-6 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-medium text-slate-400">{t("offerLabel")}</p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                    ANG-2026-001
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Clock className="h-3 w-3" />
                  {t("withAiValue", { minutes: kiMin })}
                </span>
              </div>

              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex justify-between gap-2">
                  <span>{t("lineMaterial")}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    <AnimZahl wert={material} format={euro} />
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span>
                    {t("lineLabor", {
                      hours: arbeitsstunden.toFixed(1),
                      rate: stundenlohn,
                    })}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    <AnimZahl wert={arbeit} format={euro} />
                  </span>
                </li>
              </ul>

              <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  {t("estimatedPrice")}
                </span>
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  <AnimZahl wert={gesamt} format={euro} />
                </span>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">{t("disclaimer")}</p>

            <div className="mt-5">
              <GesperrteAktion
                label={t("createPdf")}
                icon={FileText}
                variant="primary"
                eingeloggt={eingeloggt}
                onGesperrt={zeigeLoginHinweis}
                onFreigeschaltet={() => router.push("/projekte")}
              />
            </div>

            {loginHinweis && !eingeloggt ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-500/10">
                <p className="flex items-start gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                  {t("loginRequired")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/login">
                    <Button size="sm" variant="outline">
                      {t("loginAction")}
                    </Button>
                  </Link>
                  <Link href="/registrieren">
                    <Button size="sm">{t("registerAction")}</Button>
                  </Link>
                </div>
              </div>
            ) : null}

            <Link href="/registrieren" className="mt-6 block">
              <Button size="lg" className="w-full gap-2">
                {t("cta")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
