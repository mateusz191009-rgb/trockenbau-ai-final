# Trockenbau AI

Moderne SaaS-Plattform für Trockenbau-Betriebe: öffentliche Landing Page,
mehrsprachige Oberfläche und geschütztes Dashboard mit Supabase Auth & Storage.
Große Buttons, klare Navigation – handwerkerfreundlich.

## Funktionen

### Landing Page (öffentlich)

- **Hero** – Headline, Subheadline, „Kostenlos testen“ und „Login“
- **Trusted by** – horizontaler Firmen-Scroller („Vertraut von“)
- **Features** – Kundenverwaltung, Baustellen, Foto-Upload, KI-Angebote, PDF, Rechnungen, Mehrsprachigkeit
- **So funktioniert's** – 3-Schritte-Erklärung
- **Screenshots** – Platzhalter-Mockups (Dashboard, Projekte, Angebote)
- **CTA** – Abschluss-Bereich mit Registrierungs-Link
- **Footer** – Impressum, Datenschutz, Kontakt

### Anmeldung & Routing

- Flow: **Landing Page → Login / Registrieren → Dashboard**
- Login, Registrierung, Passwort vergessen, Neues Passwort (Supabase Auth)
- Geschützte Dashboard-Routen; öffentlich: Landing, Auth, Rechtliches
- Angemeldete Nutzer werden von Login/Registrierung nach `/dashboard` weitergeleitet

### Dashboard (geschützt)

- **Dashboard** – Kennzahlen, letzte Projekte, letzte Aktivitäten
- **Kunden** – Anlegen, bearbeiten, suchen, löschen
- **Projekte / Baustellen** – Status-Filter, Detailseite mit Maßen, Notizen, Dateien
- **Dateien** – globale Übersicht mit Typ-Filter
- **Angebote** – offene Angebote, Auftrag erhalten
- **Einstellungen** – Darstellung, Firmendaten, Konto / Abmelden
- Datei-Upload (Bilder, PDFs, Grundrisse, Sprachnachrichten) in Supabase Storage
- Hell-/Dunkelmodus, responsiv

### Mehrsprachigkeit (next-intl)

**9 Sprachen**, Standard: **Deutsch**

| Code | Sprache |
|------|---------|
| `de` | Deutsch |
| `pl` | Polski |
| `ro` | Română |
| `tr` | Türkçe |
| `ar` | العربية (RTL) |
| `uk` | Українська |
| `ru` | Русский |
| `sr` | Srpski |
| `sq` | Shqip |

- Sprachumschalter (Globe-Icon) auf Landing Page, Auth-Seiten und im Dashboard (Topbar)
- Übersetzt: Landing Page, Auth, Sidebar, Dashboard und alle App-Bereiche (Kunden, Projekte, Dateien, Angebote, Einstellungen)
- Locale-Prefix `as-needed`: Deutsch unter `/`, andere Sprachen z. B. `/pl/dashboard`
- Übersetzungsdateien in `messages/*.json`

## Technik

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS 3**
- **next-intl** – i18n mit `[locale]`-Routing
- **Supabase** – `@supabase/supabase-js`, `@supabase/ssr` (Auth, DB, Storage)
- **next-themes** – Hell/Dunkel
- **lucide-react** – Icons
- Auth-Session per Cookies + kombinierte Middleware (i18n + Session-Refresh)

## Einrichtung

### 1. Pakete installieren

```bash
npm install
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

- **Ohne Login:** Landing Page unter `/`
- **Mit Konto:** Registrieren oder Login → Dashboard unter `/dashboard`

Weitere Scripts:

```bash
npm run build      # Produktions-Build
npm run start      # Produktionsserver
npm run lint       # ESLint
npm run type-check # TypeScript ohne Emit
```

## Routen

| Route | Zugriff | Beschreibung |
|-------|---------|--------------|
| `/` | Öffentlich | Landing Page |
| `/login`, `/registrieren` | Öffentlich | Auth |
| `/passwort-vergessen`, `/neues-passwort` | Öffentlich | Passwort-Flow |
| `/impressum`, `/datenschutz`, `/kontakt` | Öffentlich | Rechtliches |
| `/dashboard` | Geschützt | Dashboard-Start |
| `/kunden`, `/projekte`, `/dateien`, `/angebote`, `/einstellungen` | Geschützt | App-Bereiche |
| `/projekte/[id]` | Geschützt | Baustellen-Detail |
| `/auth/callback` | Öffentlich | Supabase E-Mail-Links |

Mit anderer Sprache (Beispiel Polnisch): `/pl`, `/pl/dashboard`, `/pl/kunden`, …

## Architektur

```
messages/                  Übersetzungen (de, pl, ro, tr, ar, uk, ru, sr, sq)
src/
  i18n/
    routing.ts             Locales, Default, Prefix-Strategie
    request.ts             next-intl Server-Config
    navigation.ts          Locale-aware Link, redirect, useRouter
  hooks/
    useStatusLabels.ts     Übersetzte Status- & Dateityp-Labels
  utils/supabase/          Clients: client / server / middleware
  middleware.ts            next-intl + Session-Refresh + Routenschutz
  store/
    AuthContext.tsx        Login, Registrierung, Logout, Passwort-Reset
    DataContext.tsx        Laden + CRUD über Supabase
  lib/
    database.ts            Tabellen-CRUD + Mapping
    storage.ts             Upload / signierte URLs / Löschen
    status.ts              Status-Styles (Labels via i18n)
    navigation.ts          Sidebar-Navigation (Keys → Übersetzungen)
  app/
    layout.tsx             Root Pass-through
    [locale]/
      layout.tsx           HTML, Provider, next-intl, Theme, Auth, Data
      page.tsx             Landing Page
      login/, registrieren/, passwort-vergessen/, neues-passwort/
      impressum/, datenschutz/, kontakt/
      dashboard/           Dashboard-Start (ehemals /)
      kunden/, projekte/, dateien/, angebote/, einstellungen/
      auth/callback/       E-Mail-Links (Code → Session)
  components/
    landing/               Navbar, Hero, TrustedBy, Features, HowItWorks, …
    i18n/                  LanguageSwitcher
    layout/                AppShell, Sidebar, Topbar, PageHeader
    auth/, kunden/, projekte/, dateien/, dashboard/, ui/
  types/
supabase/schema.sql        SQL-Schema (Tabellen, RLS, Storage)
```

## i18n – neue Übersetzungen

Neue Keys in `messages/de.json` (und allen anderen Locale-Dateien) unter u. a.:

- `common` – Speichern, Abbrechen, Löschen, Suchen, …
- `sidebar` – Navigation
- `dashboard`, `customers`, `projects`, `projectDetail`, `files`, `offers`, `settings`
- `status`, `fileTypes` – Projektstatus und Dateitypen
- `landing`, `auth`, `footer`, `legal`

Komponenten nutzen `useTranslations()` aus `next-intl`; Links und Redirects über `@/i18n/navigation`.

## Hinweise

- Dateien liegen in privaten Buckets; angezeigt wird über zeitlich begrenzte signierte URLs (1 Stunde).
- Firmendaten in den Einstellungen sind eine lokale Einstellung (Browser-Speicher), keine Nutzerdaten in der Datenbank.
- Es werden keine Demodaten angelegt – die App startet leer.
- Arabisch (`ar`) nutzt RTL-Layout (`dir="rtl"` auf `<html>`).
