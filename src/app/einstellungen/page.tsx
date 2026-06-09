"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Building2,
  UserCircle,
  Check,
  LogOut,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useData } from "@/store/DataContext";
import { useAuth } from "@/store/AuthContext";
import { cn } from "@/lib/utils";

export default function EinstellungenPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const router = useRouter();
  const { user, abmelden } = useAuth();
  const { firmendaten, firmendatenSpeichern } = useData();

  const [werte, setWerte] = React.useState(firmendaten);
  const [gespeichert, setGespeichert] = React.useState(false);

  React.useEffect(() => setWerte(firmendaten), [firmendaten]);

  const speichern = (e: React.FormEvent) => {
    e.preventDefault();
    firmendatenSpeichern(werte);
    setGespeichert(true);
    window.setTimeout(() => setGespeichert(false), 2500);
  };

  const ausloggen = async () => {
    await abmelden();
    router.push("/login");
    router.refresh();
  };

  const themen = [
    { value: "light", label: "Hell", icon: Sun },
    { value: "dark", label: "Dunkel", icon: Moon },
    { value: "system", label: "Automatisch", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Einstellungen"
        description="Passen Sie die App an Ihren Betrieb an."
      />

      {/* Darstellung */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg">Darstellung</CardTitle>
            <CardDescription>Hell oder dunkel — ganz wie Sie mögen.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {themen.map((t) => {
              const Icon = t.icon;
              const aktiv = mounted && theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-base font-semibold transition-colors",
                    aktiv
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Firmendaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              <Building2 className="h-5 w-5" />
            </span>
            Meine Firma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={speichern} className="space-y-5">
            <Field label="Firmenname" htmlFor="firmenname">
              <Input
                id="firmenname"
                value={werte.firmenname}
                onChange={(e) =>
                  setWerte((w) => ({ ...w, firmenname: e.target.value }))
                }
                placeholder="z. B. Mustermann Trockenbau"
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Telefon" htmlFor="telefon">
                <Input
                  id="telefon"
                  type="tel"
                  value={werte.telefon}
                  onChange={(e) =>
                    setWerte((w) => ({ ...w, telefon: e.target.value }))
                  }
                  placeholder="089 1234567"
                />
              </Field>
              <Field label="E-Mail" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={werte.email}
                  onChange={(e) =>
                    setWerte((w) => ({ ...w, email: e.target.value }))
                  }
                  placeholder="info@firma.de"
                />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Button size="lg" type="submit">
                Speichern
              </Button>
              {gespeichert ? (
                <span className="flex items-center gap-1.5 text-base font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-5 w-5" />
                  Gespeichert
                </span>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Konto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <UserCircle className="h-5 w-5" />
            </span>
            Konto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Angemeldet als</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {user?.email ?? "—"}
            </p>
          </div>
          <Button
            variant="danger"
            size="lg"
            className="w-full sm:w-auto"
            onClick={ausloggen}
          >
            <LogOut className="h-5 w-5" />
            Abmelden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
