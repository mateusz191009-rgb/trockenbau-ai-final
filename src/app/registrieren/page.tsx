"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";

export default function RegistrierenPage() {
  const { registrieren } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [passwort, setPasswort] = React.useState("");
  const [passwort2, setPasswort2] = React.useState("");
  const [fehler, setFehler] = React.useState<string | null>(null);
  const [laedt, setLaedt] = React.useState(false);
  const [bestaetigung, setBestaetigung] = React.useState(false);

  const absenden = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler(null);

    if (passwort.length < 6) {
      setFehler("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }
    if (passwort !== passwort2) {
      setFehler("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLaedt(true);
    const { error, bestaetigungNoetig } = await registrieren(email, passwort);
    setLaedt(false);

    if (error) {
      setFehler(error);
      return;
    }
    if (bestaetigungNoetig) {
      setBestaetigung(true);
      return;
    }
    router.push("/");
    router.refresh();
  };

  if (bestaetigung) {
    return (
      <AuthCard title="Fast geschafft!">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Wir haben dir eine E-Mail an <strong>{email}</strong> geschickt.
            Bitte bestätige deine Adresse und melde dich anschließend an.
          </p>
          <Link href="/login" className="mt-6 w-full">
            <Button size="lg" className="w-full">
              Zur Anmeldung
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Registrieren"
      subtitle="Lege dein kostenloses Konto an"
      footer={
        <>
          Schon ein Konto?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Jetzt anmelden
          </Link>
        </>
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

        <Field label="Passwort" htmlFor="passwort" hint="Mindestens 6 Zeichen">
          <Input
            id="passwort"
            type="password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </Field>

        <Field label="Passwort wiederholen" htmlFor="passwort2">
          <Input
            id="passwort2"
            type="password"
            value={passwort2}
            onChange={(e) => setPasswort2(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </Field>

        {fehler ? (
          <p className="rounded-xl bg-red-50 p-3 text-base text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {fehler}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={laedt}>
          {laedt ? "Konto wird erstellt…" : "Konto erstellen"}
        </Button>
      </form>
    </AuthCard>
  );
}
