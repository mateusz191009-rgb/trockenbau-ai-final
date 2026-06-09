"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const { anmelden } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [passwort, setPasswort] = React.useState("");
  const [fehler, setFehler] = React.useState<string | null>(null);
  const [laedt, setLaedt] = React.useState(false);

  const absenden = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler(null);
    setLaedt(true);
    const { error } = await anmelden(email, passwort);
    setLaedt(false);
    if (error) {
      setFehler(error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthCard
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link
            href="/registrieren"
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            {t("register")}
          </Link>
        </>
      }
    >
      <form onSubmit={absenden} className="space-y-5">
        <Field label={t("email")} htmlFor="email">
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

        <Field label={t("password")} htmlFor="passwort">
          <Input
            id="passwort"
            type="password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </Field>

        <div className="text-end">
          <Link
            href="/passwort-vergessen"
            className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {fehler ? (
          <p className="rounded-xl bg-red-50 p-3 text-base text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {fehler}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={laedt}>
          {laedt ? t("submitting") : t("submit")}
        </Button>
      </form>
    </AuthCard>
  );
}
