-- =============================================================
-- Trockenbau AI – Migration 0002: Angebote (KI-Angebotserstellung)
-- Im Supabase-Dashboard unter "SQL Editor" ausführen.
--
-- Enthält:
--   1. Tabelle offers (ein Datensatz pro Angebot, Positionen als JSONB)
--   2. Row Level Security (nur eigene Angebote)
--   3. updated_at-Trigger
--
-- Die Migration ist idempotent (mehrfaches Ausführen ist sicher).
-- Voraussetzung: Migration 0001 (user_settings + naechste_angebotsnummer).
-- =============================================================

-- ----------------------------------------------------------------
-- 1. Tabelle: offers
--    Ein KI-generiertes (und danach bearbeitbares) Angebot.
--    positionen speichert die Angebotspositionen als JSON-Array:
--    [{ id, art, bezeichnung, beschreibung, menge, einheit, einzelpreis }]
-- ----------------------------------------------------------------
create table if not exists public.offers (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  project_id           uuid not null references public.projects (id) on delete cascade,
  customer_id          uuid references public.customers (id) on delete set null,

  nummer               text not null,
  titel                text not null default '',
  status               text not null default 'entwurf', -- entwurf | versendet | angenommen | abgelehnt

  -- KI-Ergebnisse
  zusammenfassung      text not null default '',  -- Projektzusammenfassung
  leistungsbeschreibung text not null default '', -- Leistungsbeschreibung
  positionen           jsonb not null default '[]'::jsonb,
  arbeitsstunden       numeric(12,2) not null default 0,

  -- Kalkulations-Schnappschuss (aus den Einstellungen zum Zeitpunkt der Erstellung)
  mwst_satz            numeric(12,2) not null default 19,
  zahlungsziel         integer not null default 14,
  gueltigkeit          integer not null default 30,

  notizen              text not null default '',

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists offers_user_id_idx on public.offers (user_id);
create index if not exists offers_project_id_idx on public.offers (project_id);
create index if not exists offers_customer_id_idx on public.offers (customer_id);

-- updated_at bei jeder Änderung aktualisieren (Funktion stammt aus 0001).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------
-- 2. Row Level Security
-- ----------------------------------------------------------------
alter table public.offers enable row level security;

drop policy if exists "offers eigene auswahl" on public.offers;
create policy "offers eigene auswahl" on public.offers
  for select using (auth.uid() = user_id);

drop policy if exists "offers eigene einfuegen" on public.offers;
create policy "offers eigene einfuegen" on public.offers
  for insert with check (auth.uid() = user_id);

drop policy if exists "offers eigene aendern" on public.offers;
create policy "offers eigene aendern" on public.offers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "offers eigene loeschen" on public.offers;
create policy "offers eigene loeschen" on public.offers
  for delete using (auth.uid() = user_id);
