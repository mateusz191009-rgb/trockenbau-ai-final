"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";
import { useStatusLabels } from "@/hooks/useStatusLabels";
import { projektStatusReihenfolge } from "@/lib/status";
import type { Projekt, ProjektStatus } from "@/types";

interface ProjektFormProps {
  open: boolean;
  onClose: () => void;
  projekt: Projekt | null;
  vorgabeKundeId?: string;
}

interface FormWerte {
  projektname: string;
  kundeId: string;
  baustellenadresse: string;
  beschreibung: string;
  status: ProjektStatus;
  startdatum: string;
  enddatum: string;
}

const leer: FormWerte = {
  projektname: "",
  kundeId: "",
  baustellenadresse: "",
  beschreibung: "",
  status: "anfrage",
  startdatum: "",
  enddatum: "",
};

export function ProjektForm({
  open,
  onClose,
  projekt,
  vorgabeKundeId,
}: ProjektFormProps) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const { projektStatusLabel } = useStatusLabels();
  const { kunden, projektAnlegen, projektAktualisieren } = useData();
  const [werte, setWerte] = React.useState<FormWerte>(leer);
  const [laedt, setLaedt] = React.useState(false);
  const [fehler, setFehler] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setFehler(null);
    if (projekt) {
      setWerte({
        projektname: projekt.projektname,
        kundeId: projekt.kundeId,
        baustellenadresse: projekt.baustellenadresse,
        beschreibung: projekt.beschreibung,
        status: projekt.status,
        startdatum: projekt.startdatum ? projekt.startdatum.slice(0, 10) : "",
        enddatum: projekt.enddatum ? projekt.enddatum.slice(0, 10) : "",
      });
    } else {
      setWerte({ ...leer, kundeId: vorgabeKundeId ?? "" });
    }
  }, [open, projekt, vorgabeKundeId]);

  const speichern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!werte.projektname.trim()) return;
    setLaedt(true);
    setFehler(null);
    try {
      if (projekt) {
        await projektAktualisieren(projekt.id, werte);
      } else {
        await projektAnlegen({
          ...werte,
          masse: {
            wandflaeche: "",
            deckenflaeche: "",
            raumhoehe: "",
            sonstige: "",
          },
          notizen: "",
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setFehler(tc("saveFailed"));
    } finally {
      setLaedt(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={projekt ? t("formEdit") : t("formNew")}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} type="button">
            {tc("cancel")}
          </Button>
          <Button size="lg" type="submit" form="projekt-form" disabled={laedt}>
            {laedt ? tc("saving") : tc("save")}
          </Button>
        </>
      }
    >
      <form id="projekt-form" onSubmit={speichern} className="space-y-5">
        <Field label={t("name")} htmlFor="projektname" required>
          <Input
            id="projektname"
            value={werte.projektname}
            onChange={(e) =>
              setWerte((w) => ({ ...w, projektname: e.target.value }))
            }
            placeholder={t("namePlaceholder")}
            autoFocus
          />
        </Field>

        <Field label={t("customer")} htmlFor="kunde">
          {kunden.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-base text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              {t("noCustomers")}{" "}
              <Link href="/kunden" className="font-semibold underline">
                {t("addCustomerFirst")}
              </Link>
              .
            </p>
          ) : (
            <Select
              id="kunde"
              value={werte.kundeId}
              onChange={(e) =>
                setWerte((w) => ({ ...w, kundeId: e.target.value }))
              }
            >
              <option value="">{tc("pleaseSelect")}</option>
              {kunden.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.firmenname}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label={t("siteAddress")} htmlFor="adresse">
          <Input
            id="adresse"
            value={werte.baustellenadresse}
            onChange={(e) =>
              setWerte((w) => ({ ...w, baustellenadresse: e.target.value }))
            }
            placeholder={tc("addressPlaceholder")}
          />
        </Field>

        <Field label={tc("description")} htmlFor="beschreibung">
          <Textarea
            id="beschreibung"
            value={werte.beschreibung}
            onChange={(e) =>
              setWerte((w) => ({ ...w, beschreibung: e.target.value }))
            }
            placeholder={t("descriptionPlaceholder")}
          />
        </Field>

        <Field label={tc("status")} htmlFor="status">
          <Select
            id="status"
            value={werte.status}
            onChange={(e) =>
              setWerte((w) => ({
                ...w,
                status: e.target.value as ProjektStatus,
              }))
            }
          >
            {projektStatusReihenfolge.map((s) => (
              <option key={s} value={s}>
                {projektStatusLabel(s)}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("startDate")} htmlFor="startdatum">
            <Input
              id="startdatum"
              type="date"
              value={werte.startdatum}
              onChange={(e) =>
                setWerte((w) => ({ ...w, startdatum: e.target.value }))
              }
            />
          </Field>
          <Field label={t("endDate")} htmlFor="enddatum">
            <Input
              id="enddatum"
              type="date"
              value={werte.enddatum}
              onChange={(e) =>
                setWerte((w) => ({ ...w, enddatum: e.target.value }))
              }
            />
          </Field>
        </div>

        {fehler ? (
          <p className="rounded-xl bg-red-50 p-3 text-base text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {fehler}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
