"use client";

import * as React from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AuthErgebnis {
  error: string | null;
  /** Bei Registrierung: true, wenn noch E-Mail-Bestätigung nötig ist. */
  bestaetigungNoetig?: boolean;
}

interface AuthContextWert {
  supabase: SupabaseClient;
  user: User | null;
  loading: boolean;
  anmelden: (email: string, passwort: string) => Promise<AuthErgebnis>;
  registrieren: (email: string, passwort: string) => Promise<AuthErgebnis>;
  abmelden: () => Promise<void>;
  passwortVergessen: (email: string) => Promise<AuthErgebnis>;
  passwortAendern: (passwort: string) => Promise<AuthErgebnis>;
}

const AuthContext = React.createContext<AuthContextWert | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Genau ein Browser-Client für die ganze App.
  const supabase = React.useMemo(() => createClient(), []);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let aktiv = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!aktiv) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      aktiv = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const herkunft = () =>
    typeof window !== "undefined" ? window.location.origin : "";

  const wert = React.useMemo<AuthContextWert>(
    () => ({
      supabase,
      user,
      loading,

      anmelden: async (email, passwort) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: passwort,
        });
        return { error: error ? uebersetzeFehler(error.message) : null };
      },

      registrieren: async (email, passwort) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: passwort,
          options: { emailRedirectTo: `${herkunft()}/auth/callback` },
        });
        if (error) return { error: uebersetzeFehler(error.message) };
        // Wenn keine Session zurückkommt, ist E-Mail-Bestätigung aktiv.
        return { error: null, bestaetigungNoetig: !data.session };
      },

      abmelden: async () => {
        await supabase.auth.signOut();
        setUser(null);
      },

      passwortVergessen: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${herkunft()}/auth/callback?next=/neues-passwort`,
        });
        return { error: error ? uebersetzeFehler(error.message) : null };
      },

      passwortAendern: async (passwort) => {
        const { error } = await supabase.auth.updateUser({ password: passwort });
        return { error: error ? uebersetzeFehler(error.message) : null };
      },
    }),
    [supabase, user, loading],
  );

  return <AuthContext.Provider value={wert}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextWert {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden");
  }
  return ctx;
}

/** Häufige Supabase-Fehlermeldungen auf Deutsch. */
function uebersetzeFehler(meldung: string): string {
  const m = meldung.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-Mail oder Passwort ist falsch.";
  if (m.includes("user already registered") || m.includes("already exists"))
    return "Diese E-Mail ist bereits registriert.";
  if (m.includes("password should be at least"))
    return "Das Passwort muss mindestens 6 Zeichen haben.";
  if (m.includes("email not confirmed"))
    return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Zu viele Versuche. Bitte später erneut probieren.";
  return meldung;
}
