"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";
import type { Kunde } from "@/types";

interface KundeFormProps {
  open: boolean;
  onClose: () => void;
  kunde: Kunde | null; // null = neuer Kunde
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
  const { kundeAnlegen, kundeAktualisieren } = useData();
  const [werte, setWerte] = React.useState(leer);

  // Formular füllen, wenn ein Kunde bearbeitet wird.
  React.useEffect(() => {
    if (open) {
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

  const setFeld = (feld: keyof typeof leer) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setWerte((w) => ({ ...w, [feld]: e.target.value }));

  const speichern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!werte.firmenname.trim()) return;
    if (kunde) kundeAktualisieren(kunde.id, werte);
    else kundeAnlegen(werte);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={kunde ? "Kunde bearbeiten" : "Neuer Kunde"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} type="button">
            Abbrechen
          </Button>
          <Button size="lg" type="submit" form="kunde-form">
            Speichern
          </Button>
        </>
      }
    >
      <form id="kunde-form" onSubmit={speichern} className="space-y-5">
        <Field label="Firmenname" htmlFor="firmenname" required>
          <Input
            id="firmenname"
            value={werte.firmenname}
            onChange={setFeld("firmenname")}
            placeholder="z. B. Bauträger Sonnenhof GmbH"
            autoFocus
          />
        </Field>

        <Field label="Ansprechpartner" htmlFor="ansprechpartner">
          <Input
            id="ansprechpartner"
            value={werte.ansprechpartner}
            onChange={setFeld("ansprechpartner")}
            placeholder="z. B. Michael Wagner"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Telefon" htmlFor="telefon">
            <Input
              id="telefon"
              type="tel"
              value={werte.telefon}
              onChange={setFeld("telefon")}
              placeholder="0151 23456789"
            />
          </Field>
          <Field label="E-Mail" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={werte.email}
              onChange={setFeld("email")}
              placeholder="name@firma.de"
            />
          </Field>
        </div>

        <Field label="Adresse" htmlFor="adresse">
          <Input
            id="adresse"
            value={werte.adresse}
            onChange={setFeld("adresse")}
            placeholder="Straße, PLZ, Ort"
          />
        </Field>

        <Field label="Notizen" htmlFor="notizen">
          <Textarea
            id="notizen"
            value={werte.notizen}
            onChange={setFeld("notizen")}
            placeholder="Wichtige Infos zum Kunden…"
          />
        </Field>
      </form>
    </Modal>
  );
}
