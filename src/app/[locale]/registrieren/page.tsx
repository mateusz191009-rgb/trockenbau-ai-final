"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";

export default function RegistrierenPage() {
  const t = useTranslations("auth");
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
      setFehler(t("errors.passwordMin"));
      return;
    }
    if (passwort !== passwort2) {
      setFehler(t("errors.passwordMismatch"));
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
    router.push("/dashboard");
    router.refresh();
  };

  if (bestaetigung) {
    return (
      <AuthCard title={t("register.confirmationTitle")}>
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            {t("register.confirmationText", { email })}
          </p>
          <Link href="/login" className="mt-6 w-full">
            <Button size="lg" className="w-full">
              {t("register.toLogin")}
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <>
          {t("register.hasAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            {t("register.login")}
          </Link>
        </>
      }
    >
      <form onSubmit={absenden} className="space-y-5">
        <Field label={t("register.email")} htmlFor="email">
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

        <Field
          label={t("register.password")}
          htmlFor="passwort"
          hint={t("register.passwordHint")}
        >
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

        <Field label={t("register.passwordRepeat")} htmlFor="passwort2">
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
          {laedt ? t("register.submitting") : t("register.submit")}
        </Button>
      </form>
    </AuthCard>
  );
}
