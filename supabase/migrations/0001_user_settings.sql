-- =============================================================
-- Trockenbau AI – Migration 0001: Benutzer-Einstellungen
-- Im Supabase-Dashboard unter "SQL Editor" ausführen.
--
-- Enthält:
--   1. Tabelle user_settings (eine Zeile pro Nutzer)
--   2. Row Level Security (nur eigene Einstellungen)
--   3. Storage-Bucket "logos" + Policies (nur eigener Ordner)
--   4. Hilfsfunktionen für fortlaufende Angebots-/Rechnungsnummern
--
-- Die Migration ist idempotent (mehrfaches Ausführen ist sicher).
-- =============================================================

-- ----------------------------------------------------------------
-- 1. Tabelle: user_settings
--    Speichert Firmendaten, Logo, Kalkulation, Angebots-/Rechnungs-
--    Einstellungen und KI-Schalter — jeweils pro Nutzer.
-- ----------------------------------------------------------------
create table if not exists public.user_settings (
  user_id                 uuid primary key references auth.users (id) on delete cascade,

  -- Firmendaten
  firmenname              text not null default '',
  inhaber                 text not null default '',
  ansprechpartner         text not null default '',
  strasse                 text not null default '',
  hausnummer              text not null default '',
  plz                     text not null default '',
  ort                     text not null default '',
  telefon                 text not null default '',
  mobil                   text not null default '',
  email                   text not null default '',
  website                 text not null default '',
  ust_id                  text not null default '',

  -- Firmenlogo (Pfad im Storage-Bucket "logos": {user_id}/{uuid}.ext)
  logo_path               text,

  -- Kalkulation
  stundenlohn             numeric(12,2) not null default 0,
  materialaufschlag       numeric(12,2) not null default 0,
  gewinnmarge             numeric(12,2) not null default 0,
  fahrtkosten_pro_km      numeric(12,2) not null default 0,
  mindestanfahrt          numeric(12,2) not null default 0,
  entsorgungspauschale    numeric(12,2) not null default 0,
  mehrwertsteuer          numeric(12,2) not null default 19,

  -- Angebots-Einstellungen (eigene Nummern-Sequenz pro Nutzer)
  angebot_praefix         text not null default 'ANG-2026-',
  angebot_nummer          integer not null default 1,
  angebot_zahlungsziel    integer not null default 14,
  angebot_gueltigkeit     integer not null default 30,

  -- Rechnungs-Einstellungen (eigene Nummern-Sequenz pro Nutzer)
  rechnung_praefix        text not null default 'RE-2026-',
  rechnung_nummer         integer not null default 1,
  rechnung_zahlungsziel   integer not null default 14,
  bankname                text not null default '',
  iban                    text not null default '',
  bic                     text not null default '',

  -- KI-Vorbereitung (Standard: aktiviert)
  ki_material             boolean not null default true,
  ki_arbeitsstunden       boolean not null default true,
  ki_preise               boolean not null default true,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- updated_at bei jeder Änderung aktualisieren.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------
-- 2. Row Level Security
--    Jeder Nutzer sieht/ändert ausschließlich seine eigene Zeile.
-- ----------------------------------------------------------------
alter table public.user_settings enable row level security;

drop policy if exists "settings eigene auswahl" on public.user_settings;
create policy "settings eigene auswahl" on public.user_settings
  for select using (auth.uid() = user_id);

drop policy if exists "settings eigene einfuegen" on public.user_settings;
create policy "settings eigene einfuegen" on public.user_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "settings eigene aendern" on public.user_settings;
create policy "settings eigene aendern" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "settings eigene loeschen" on public.user_settings;
create policy "settings eigene loeschen" on public.user_settings
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 3. Storage-Bucket: logos (privat)
--    Zugriff nur auf den eigenen Ordner (erster Pfadteil = user_id),
--    Anzeige über signierte URLs.
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('logos', 'logos', false)
on conflict (id) do nothing;

drop policy if exists "logos eigene auswahl" on storage.objects;
create policy "logos eigene auswahl" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logos eigene einfuegen" on storage.objects;
create policy "logos eigene einfuegen" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logos eigene aendern" on storage.objects;
create policy "logos eigene aendern" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logos eigene loeschen" on storage.objects;
create policy "logos eigene loeschen" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------
-- 4. Hilfsfunktionen: fortlaufende Nummern (atomar, pro Nutzer)
--    Geben die aktuelle Nummer (als Präfix + 3-stellige Nummer)
--    zurück und erhöhen den Zähler. Werden später von den Angebots-/
--    Rechnungs-Features genutzt. RLS-sicher durch auth.uid().
-- ----------------------------------------------------------------
create or replace function public.naechste_angebotsnummer()
returns text
language plpgsql
security invoker
as $$
declare
  v_praefix text;
  v_nummer  integer;
begin
  update public.user_settings
     set angebot_nummer = angebot_nummer + 1
   where user_id = auth.uid()
  returning angebot_praefix, angebot_nummer - 1
       into v_praefix, v_nummer;

  if v_praefix is null then
    raise exception 'Keine Einstellungen für den aktuellen Nutzer gefunden';
  end if;

  return v_praefix || lpad(v_nummer::text, 3, '0');
end;
$$;

create or replace function public.naechste_rechnungsnummer()
returns text
language plpgsql
security invoker
as $$
declare
  v_praefix text;
  v_nummer  integer;
begin
  update public.user_settings
     set rechnung_nummer = rechnung_nummer + 1
   where user_id = auth.uid()
  returning rechnung_praefix, rechnung_nummer - 1
       into v_praefix, v_nummer;

  if v_praefix is null then
    raise exception 'Keine Einstellungen für den aktuellen Nutzer gefunden';
  end if;

  return v_praefix || lpad(v_nummer::text, 3, '0');
end;
$$;
