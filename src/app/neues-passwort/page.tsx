"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";

export default function NeuesPasswortPage() {
  const { passwortAendern, user, loading } = useAuth();
  const router = useRouter();
  const [passwort, setPasswort] = React.useState("");
  const [passwort2, setPasswort2] = React.useState("");
  const [fehler, setFehler] = React.useState<string | null>(null);
  const [laedt, setLaedt] = React.useState(false);

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
    const { error } = await passwortAendern(passwort);
    setLaedt(false);
    if (error) {
      setFehler(error);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <AuthCard
      title="Neues Passwort"
      subtitle="Vergib jetzt ein neues Passwort für dein Konto"
    >
      {!loading && !user ? (
        <p className="rounded-xl bg-amber-50 p-3 text-base text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen
          Link an.
        </p>
      ) : (
        <form onSubmit={absenden} className="space-y-5">
          <Field label="Neues Passwort" htmlFor="passwort" hint="Mindestens 6 Zeichen">
            <Input
              id="passwort"
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              autoFocus
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
            {laedt ? "Wird gespeichert…" : "Passwort speichern"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
