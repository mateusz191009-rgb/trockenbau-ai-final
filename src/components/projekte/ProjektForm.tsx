"use client";

import * as React from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";
import { projektStatusMeta, projektStatusReihenfolge } from "@/lib/status";
import type { Projekt, ProjektStatus } from "@/types";

interface ProjektFormProps {
  open: boolean;
  onClose: () => void;
  projekt: Projekt | null;
  /** Kunde vorbelegen (z. B. von der Kundenseite aus). */
  vorgabeKundeId?: string;
}

interface FormWerte {
  projektname: string;
  kundeId: string;
  baustellenadresse: string;
  beschreibung: string;
  status: ProjektStatus;
  startdatum: string;
}

const leer: FormWerte = {
  projektname: "",
  kundeId: "",
  baustellenadresse: "",
  beschreibung: "",
  status: "anfrage",
  startdatum: "",
};

export function ProjektForm({
  open,
  onClose,
  projekt,
  vorgabeKundeId,
}: ProjektFormProps) {
  const { kunden, projektAnlegen, projektAktualisieren } = useData();
  const [werte, setWerte] = React.useState<FormWerte>(leer);

  React.useEffect(() => {
    if (!open) return;
    if (projekt) {
      setWerte({
        projektname: projekt.projektname,
        kundeId: projekt.kundeId,
        baustellenadresse: projekt.baustellenadresse,
        beschreibung: projekt.beschreibung,
        status: projekt.status,
        startdatum: projekt.startdatum ? projekt.startdatum.slice(0, 10) : "",
      });
    } else {
      setWerte({ ...leer, kundeId: vorgabeKundeId ?? "" });
    }
  }, [open, projekt, vorgabeKundeId]);

  const speichern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!werte.projektname.trim()) return;

    if (projekt) {
      projektAktualisieren(projekt.id, werte);
    } else {
      projektAnlegen({
        ...werte,
        masse: { wandflaeche: "", deckenflaeche: "", raumhoehe: "", sonstige: "" },
        notizen: "",
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={projekt ? "Baustelle bearbeiten" : "Neue Baustelle"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} type="button">
            Abbrechen
          </Button>
          <Button size="lg" type="submit" form="projekt-form">
            Speichern
          </Button>
        </>
      }
    >
      <form id="projekt-form" onSubmit={speichern} className="space-y-5">
        <Field label="Projektname" htmlFor="projektname" required>
          <Input
            id="projektname"
            value={werte.projektname}
            onChange={(e) =>
              setWerte((w) => ({ ...w, projektname: e.target.value }))
            }
            placeholder="z. B. Trockenbau Bürogebäude 2. OG"
            autoFocus
          />
        </Field>

        <Field label="Kunde" htmlFor="kunde">
          {kunden.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-base text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              Noch keine Kunden vorhanden.{" "}
              <Link href="/kunden" className="font-semibold underline">
                Zuerst einen Kunden anlegen
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
              <option value="">Bitte wählen…</option>
              {kunden.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.firmenname}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Baustellenadresse" htmlFor="adresse">
          <Input
            id="adresse"
            value={werte.baustellenadresse}
            onChange={(e) =>
              setWerte((w) => ({ ...w, baustellenadresse: e.target.value }))
            }
            placeholder="Straße, PLZ, Ort"
          />
        </Field>

        <Field label="Beschreibung" htmlFor="beschreibung">
          <Textarea
            id="beschreibung"
            value={werte.beschreibung}
            onChange={(e) =>
              setWerte((w) => ({ ...w, beschreibung: e.target.value }))
            }
            placeholder="Was soll gemacht werden?"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Status" htmlFor="status">
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
                  {projektStatusMeta[s].label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Startdatum" htmlFor="startdatum">
            <Input
              id="startdatum"
              type="date"
              value={werte.startdatum}
              onChange={(e) =>
                setWerte((w) => ({ ...w, startdatum: e.target.value }))
              }
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
