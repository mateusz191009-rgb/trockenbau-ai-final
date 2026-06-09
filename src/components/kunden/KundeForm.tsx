"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";
import type { Kunde } from "@/types";

interface KundeFormProps {
  open: boolean;
  onClose: () => void;
  kunde: Kunde | null;
}

const leer = {
  firmenname: "",
  ansprechpartner: "",
  telefon: "",
  email: "",
  adresse: "",
  notizen: "",
};

export function KundeForm({ open, onClose, kunde }: KundeFormProps) {
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const { kundeAnlegen, kundeAktualisieren } = useData();
  const [werte, setWerte] = React.useState(leer);
  const [laedt, setLaedt] = React.useState(false);
  const [fehler, setFehler] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setFehler(null);
      setWerte(
        kunde
          ? {
              firmenname: kunde.firmenname,
              ansprechpartner: kunde.ansprechpartner,
              telefon: kunde.telefon,
              email: kunde.email,
              adresse: kunde.adresse,
              notizen: kunde.notizen,
            }
          : leer,
      );
    }
  }, [open, kunde]);

  const setFeld =
    (feld: keyof typeof leer) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setWerte((w) => ({ ...w, [feld]: e.target.value }));

  const speichern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!werte.firmenname.trim()) return;
    setLaedt(true);
    setFehler(null);
    try {
      if (kunde) await kundeAktualisieren(kunde.id, werte);
      else await kundeAnlegen(werte);
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
      title={kunde ? t("formEdit") : t("formNew")}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} type="button">
            {tc("cancel")}
          </Button>
          <Button size="lg" type="submit" form="kunde-form" disabled={laedt}>
            {laedt ? tc("saving") : tc("save")}
          </Button>
        </>
      }
    >
      <form id="kunde-form" onSubmit={speichern} className="space-y-5">
        <Field label={tc("companyName")} htmlFor="firmenname" required>
          <Input
            id="firmenname"
            value={werte.firmenname}
            onChange={setFeld("firmenname")}
            placeholder={t("companyPlaceholder")}
            autoFocus
          />
        </Field>

        <Field label={t("contactPerson")} htmlFor="ansprechpartner">
          <Input
            id="ansprechpartner"
            value={werte.ansprechpartner}
            onChange={setFeld("ansprechpartner")}
            placeholder={t("contactPlaceholder")}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={tc("phone")} htmlFor="telefon">
            <Input
              id="telefon"
              type="tel"
              value={werte.telefon}
              onChange={setFeld("telefon")}
              placeholder="0151 23456789"
            />
          </Field>
          <Field label={tc("email")} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={werte.email}
              onChange={setFeld("email")}
              placeholder="name@firma.de"
            />
          </Field>
        </div>

        <Field label={t("address")} htmlFor="adresse">
          <Input
            id="adresse"
            value={werte.adresse}
            onChange={setFeld("adresse")}
            placeholder={tc("addressPlaceholder")}
          />
        </Field>

        <Field label={tc("notes")} htmlFor="notizen">
          <Textarea
            id="notizen"
            value={werte.notizen}
            onChange={setFeld("notizen")}
            placeholder={t("notesPlaceholder")}
          />
        </Field>

        {fehler ? (
          <p className="rounded-xl bg-red-50 p-3 text-base text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {fehler}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
