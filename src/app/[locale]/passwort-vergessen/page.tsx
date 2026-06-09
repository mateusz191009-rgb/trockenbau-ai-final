"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";

export default function PasswortVergessenPage() {
  const { passwortVergessen } = useAuth();
  const [email, setEmail] = React.useState("");
  const [fehler, setFehler] = React.useState<string | null>(null);
  const [laedt, setLaedt] = React.useState(false);
  const [gesendet, setGesendet] = React.useState(false);

  const absenden = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler(null);
    setLaedt(true);
    const { error } = await passwortVergessen(email);
    setLaedt(false);
    if (error) {
      setFehler(error);
      return;
    }
    setGesendet(true);
  };

  if (gesendet) {
    return (
      <AuthCard title="E-Mail unterwegs">
        <div className="flex flex-col items-center text-center">
          <MailCheck className="h-14 w-14 text-emerald-500" />
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Falls ein Konto mit <strong>{email}</strong> existiert, haben wir
            einen Link zum Zurücksetzen des Passworts geschickt.
          </p>
          <Link href="/login" className="mt-6 w-full">
            <Button size="lg" className="w-full">
              Zurück zur Anmeldung
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Passwort vergessen"
      subtitle="Wir senden dir einen Link zum Zurücksetzen"
      footer={
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          Zurück zur Anmeldung
        </Link>
      }
    >
      <form onSubmit={absenden} className="space-y-5">
        <Field label="E-Mail" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@firma.de"
            autoComplete="email"
            required
            autoFocus
          />
        </Field>

        {fehler ? (
          <p className="rounded-xl bg-red-50 p-3 text-base text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {fehler}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={laedt}>
          {laedt ? "Wird gesendet…" : "Link senden"}
        </Button>
      </form>
    </AuthCard>
  );
}
