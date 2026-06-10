"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Package, Hammer, Truck, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import {
  berechneSummen,
  formatEuro,
  leerePosition,
  positionsSumme,
} from "@/lib/angebot";
import type { AngebotPosition, AngebotPositionArt } from "@/types";

const artIcons: Record<AngebotPositionArt, typeof Package> = {
  material: Package,
  arbeit: Hammer,
  fahrt: Truck,
  sonstige: Tag,
};

interface PositionenEditorProps {
  positionen: AngebotPosition[];
  mwstSatz: number;
  onChange: (positionen: AngebotPosition[]) => void;
}

export function PositionenEditor({
  positionen,
  mwstSatz,
  onChange,
}: PositionenEditorProps) {
  const t = useTranslations("angebote");

  const summen = berechneSummen(positionen, mwstSatz);

  const aktualisiere = (id: string, patch: Partial<AngebotPosition>) =>
    onChange(positionen.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const loeschen = (id: string) =>
    onChange(positionen.filter((p) => p.id !== id));

  const hinzufuegen = (art: AngebotPositionArt) =>
    onChange([...positionen, leerePosition(art)]);

  const zahl = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  const artLabel = (art: AngebotPositionArt) => t(`art.${art}`);

  return (
    <div className="space-y-4">
      {/* Desktop-Tabelle */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3 font-semibold">{t("colType")}</th>
              <th className="px-3 py-3 font-semibold">{t("colDescription")}</th>
              <th className="px-3 py-3 text-right font-semibold">{t("colQty")}</th>
              <th className="px-3 py-3 font-semibold">{t("colUnit")}</th>
              <th className="px-3 py-3 text-right font-semibold">
                {t("colPrice")}
              </th>
              <th className="px-3 py-3 text-right font-semibold">
                {t("colTotal")}
              </th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {positionen.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-100 align-top dark:border-slate-800"
              >
                <td className="px-3 py-2">
                  <Select
                    value={p.art}
                    onChange={(e) =>
                      aktualisiere(p.id, {
                        art: e.target.value as AngebotPositionArt,
                      })
                    }
                    className="h-11 text-sm"
                  >
                    <option value="material">{artLabel("material")}</option>
                    <option value="arbeit">{artLabel("arbeit")}</option>
                    <option value="fahrt">{artLabel("fahrt")}</option>
                    <option value="sonstige">{artLabel("sonstige")}</option>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={p.bezeichnung}
                    onChange={(e) =>
                      aktualisiere(p.id, { bezeichnung: e.target.value })
                    }
                    className="h-11 text-sm"
                    placeholder={t("colDescription")}
                  />
                  <Input
                    value={p.beschreibung}
                    onChange={(e) =>
                      aktualisiere(p.id, { beschreibung: e.target.value })
                    }
                    className="mt-1.5 h-9 text-xs"
                    placeholder={t("detailPlaceholder")}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={p.menge}
                    onChange={(e) =>
                      aktualisiere(p.id, { menge: zahl(e.target.value) })
                    }
                    className="h-11 w-20 text-right text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={p.einheit}
                    onChange={(e) =>
                      aktualisiere(p.id, { einheit: e.target.value })
                    }
                    className="h-11 w-20 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={p.einzelpreis}
                    onChange={(e) =>
                      aktualisiere(p.id, { einzelpreis: zahl(e.target.value) })
                    }
                    className="h-11 w-24 text-right text-sm"
                  />
                </td>
                <td className="px-3 py-2 text-right font-semibold text-slate-900 dark:text-white">
                  {formatEuro(positionsSumme(p))}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("deletePosition")}
                    className="h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => loeschen(p.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile-Karten */}
      <div className="space-y-3 lg:hidden">
        {positionen.map((p) => {
          const Icon = artIcons[p.art];
          return (
            <div
              key={p.id}
              className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Icon className="h-4 w-4" />
                  <Select
                    value={p.art}
                    onChange={(e) =>
                      aktualisiere(p.id, {
                        art: e.target.value as AngebotPositionArt,
                      })
                    }
                    className="h-10 text-sm"
                  >
                    <option value="material">{artLabel("material")}</option>
                    <option value="arbeit">{artLabel("arbeit")}</option>
                    <option value="fahrt">{artLabel("fahrt")}</option>
                    <option value="sonstige">{artLabel("sonstige")}</option>
                  </Select>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("deletePosition")}
                  className="h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={() => loeschen(p.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <Input
                value={p.bezeichnung}
                onChange={(e) =>
                  aktualisiere(p.id, { bezeichnung: e.target.value })
                }
                placeholder={t("colDescription")}
              />
              <Input
                value={p.beschreibung}
                onChange={(e) =>
                  aktualisiere(p.id, { beschreibung: e.target.value })
                }
                className="h-10 text-sm"
                placeholder={t("detailPlaceholder")}
              />
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  {t("colQty")}
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={p.menge}
                    onChange={(e) =>
                      aktualisiere(p.id, { menge: zahl(e.target.value) })
                    }
                    className="mt-1 h-11 text-right text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  {t("colUnit")}
                  <Input
                    value={p.einheit}
                    onChange={(e) =>
                      aktualisiere(p.id, { einheit: e.target.value })
                    }
                    className="mt-1 h-11 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  {t("colPrice")}
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={p.einzelpreis}
                    onChange={(e) =>
                      aktualisiere(p.id, { einzelpreis: zahl(e.target.value) })
                    }
                    className="mt-1 h-11 text-right text-sm"
                  />
                </label>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold dark:border-slate-800">
                <span className="text-slate-500">{t("colTotal")}</span>
                <span className="text-slate-900 dark:text-white">
                  {formatEuro(positionsSumme(p))}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hinzufügen */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => hinzufuegen("material")}
        >
          <Plus className="h-5 w-5" />
          {t("addMaterial")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => hinzufuegen("arbeit")}
        >
          <Plus className="h-5 w-5" />
          {t("addLabor")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => hinzufuegen("sonstige")}
        >
          <Plus className="h-5 w-5" />
          {t("addOther")}
        </Button>
      </div>

      {/* Summen */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <dl className="ml-auto max-w-sm space-y-2">
          <div className="flex justify-between text-base text-slate-600 dark:text-slate-300">
            <dt>{t("net")}</dt>
            <dd className="font-semibold">{formatEuro(summen.netto)}</dd>
          </div>
          <div className="flex justify-between text-base text-slate-600 dark:text-slate-300">
            <dt>{t("vat", { rate: mwstSatz })}</dt>
            <dd className="font-semibold">{formatEuro(summen.mwstBetrag)}</dd>
          </div>
          <div className="flex justify-between border-t-2 border-slate-300 pt-2 text-xl font-bold text-slate-900 dark:border-slate-600 dark:text-white">
            <dt>{t("gross")}</dt>
            <dd>{formatEuro(summen.brutto)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
