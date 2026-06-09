# Trockenbau AI

Einfache Verwaltungs-App für Trockenbau-Betriebe – mit Login und Supabase als
Datenbank/Storage. Große Buttons, klare Navigation, komplett auf Deutsch.

## Funktionen

- Anmeldung: Login, Registrierung, Passwort vergessen, Abmelden (Supabase Auth)
- Geschützte Routen (Middleware leitet nicht angemeldete Nutzer zum Login)
- Kunden, Projekte/Baustellen, Projektdetails (Maße, Notizen), Dateien, Angebote
- Datei-Upload (Bilder, PDFs, Grundrisse, Sprachnachrichten) in Supabase Storage
- Dashboard mit echten Zahlen: Kunden, Projekte, aktive Baustellen, offene Angebote
- Hell-/Dunkelmodus, responsiv

## Technik

- Next.js 14 (App Router), TypeScript, Tailwind CSS 3
- Supabase: `@supabase/supabase-js`, `@supabase/ssr`
- Auth-Session per Cookies + Middleware-Refresh

## Einrichtung

### 1. Pakete installieren

```bash
npm install
# Supabase-Pakete (falls noch nicht vorhanden):
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Umgebungsvariablen

`.env.local` im Projekt-Root anlegen (Vorlage: `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

Beide Werte stehen im Supabase-Dashboard unter **Project Settings → API**.

### 3. Datenbank & Storage einrichten

Im Supabase-Dashboard den **SQL Editor** öffnen und den Inhalt von
[`supabase/schema.sql`](supabase/schema.sql) ausführen. Das legt an:

- Tabellen `customers`, `projects`, `project_files`
- Row Level Security (jeder Nutzer sieht nur seine eigenen Daten)
- Storage-Buckets `images`, `pdfs`, `audio`, `floorplans` inkl. Policies

### 4. Auth-Redirect-URLs (Supabase-Dashboard)

Unter **Authentication → URL Configuration**:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

(für Produktion zusätzlich die echte Domain eintragen)

### 5. Starten

```bash
npm run dev
# http://localhost:3000
```

Beim ersten Besuch wirst du zur Anmeldung geleitet. Konto unter
„Registrieren" anlegen (ggf. E-Mail bestätigen) und loslegen.

## Architektur

```
src/
  utils/supabase/        Supabase-Clients: client / server / middleware
  middleware.ts          Session-Refresh + Schutz aller Routen
  store/
    AuthContext.tsx      Login, Registrierung, Logout, Passwort-Reset
    DataContext.tsx      Laden + CRUD über Supabase (ersetzt localStorage)
  lib/
    database.ts          Tabellen-CRUD + Mapping Row <-> App-Typ
    storage.ts           Upload / signierte URLs / Löschen (Buckets)
  app/
    login, registrieren, passwort-vergessen, neues-passwort
    auth/callback/route.ts   verarbeitet E-Mail-Links (Code -> Session)
    (Dashboard, kunden, projekte, dateien, angebote, einstellungen)
  components/            UI, Layout, Auth-Karte, Module
  types/                 gemeinsame App-Typen
supabase/schema.sql      SQL-Schema (Tabellen, RLS, Storage)
```

## Hinweise

- Dateien liegen in privaten Buckets; angezeigt wird über zeitlich begrenzte
  signierte URLs (1 Stunde).
- Die Firmendaten in den Einstellungen sind eine lokale Einstellung
  (Browser-Speicher), keine Nutzerdaten in der Datenbank.
- Es werden keine Demodaten angelegt – die App startet leer.
