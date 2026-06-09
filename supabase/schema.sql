-- =============================================================
-- Trockenbau AI – Supabase Schema
-- Im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Enthält: Tabellen, Row Level Security, Storage-Buckets + Policies.
-- =============================================================

-- ----------------------------------------------------------------
-- Tabelle: customers (Kunden)
-- ----------------------------------------------------------------
create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  firmenname      text not null,
  ansprechpartner text,
  telefon         text,
  email           text,
  adresse         text,
  notizen         text,
  created_at      timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers (user_id);

-- ----------------------------------------------------------------
-- Tabelle: projects (Projekte / Baustellen)
-- Hinweis: notizen + die Maß-Spalten (wandflaeche ...) sind Zusatz-
-- spalten, damit die bestehende Projektdetail-Ansicht erhalten bleibt.
-- ----------------------------------------------------------------
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  customer_id       uuid references public.customers (id) on delete cascade,
  projektname       text not null,
  baustellenadresse text,
  beschreibung      text,
  status            text not null default 'anfrage',
  startdatum        date,
  enddatum          date,
  notizen           text,
  wandflaeche       text,
  deckenflaeche     text,
  raumhoehe         text,
  sonstige_masse    text,
  created_at        timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_customer_id_idx on public.projects (customer_id);

-- ----------------------------------------------------------------
-- Tabelle: project_files (Dateien)
-- Hinweis: mime_type + file_size sind Zusatzspalten für die Anzeige.
-- file_url speichert den Pfad innerhalb des Storage-Buckets.
-- ----------------------------------------------------------------
create table if not exists public.project_files (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  file_name   text not null,
  file_type   text not null,            -- bild | pdf | grundriss | sprachnachricht | sonstige
  file_url    text not null,            -- Pfad im Bucket: {user_id}/{uuid}.ext
  mime_type   text,
  file_size   bigint,
  created_at  timestamptz not null default now()
);

create index if not exists project_files_project_id_idx on public.project_files (project_id);
create index if not exists project_files_user_id_idx on public.project_files (user_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- Jeder Nutzer sieht/ändert nur seine eigenen Datensätze.
-- =============================================================

alter table public.customers     enable row level security;
alter table public.projects      enable row level security;
alter table public.project_files enable row level security;

-- customers
drop policy if exists "customers eigene auswahl" on public.customers;
create policy "customers eigene auswahl" on public.customers
  for select using (auth.uid() = user_id);

drop policy if exists "customers eigene einfuegen" on public.customers;
create policy "customers eigene einfuegen" on public.customers
  for insert with check (auth.uid() = user_id);

drop policy if exists "customers eigene aendern" on public.customers;
create policy "customers eigene aendern" on public.customers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "customers eigene loeschen" on public.customers;
create policy "customers eigene loeschen" on public.customers
  for delete using (auth.uid() = user_id);

-- projects
drop policy if exists "projects eigene auswahl" on public.projects;
create policy "projects eigene auswahl" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "projects eigene einfuegen" on public.projects;
create policy "projects eigene einfuegen" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "projects eigene aendern" on public.projects;
create policy "projects eigene aendern" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "projects eigene loeschen" on public.projects;
create policy "projects eigene loeschen" on public.projects
  for delete using (auth.uid() = user_id);

-- project_files
drop policy if exists "files eigene auswahl" on public.project_files;
create policy "files eigene auswahl" on public.project_files
  for select using (auth.uid() = user_id);

drop policy if exists "files eigene einfuegen" on public.project_files;
create policy "files eigene einfuegen" on public.project_files
  for insert with check (auth.uid() = user_id);

drop policy if exists "files eigene aendern" on public.project_files;
create policy "files eigene aendern" on public.project_files
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "files eigene loeschen" on public.project_files;
create policy "files eigene loeschen" on public.project_files
  for delete using (auth.uid() = user_id);

-- =============================================================
-- STORAGE BUCKETS
-- Vier private Buckets. Zugriff nur auf den eigenen Ordner
-- (erster Pfadteil = user_id), Anzeige über signierte URLs.
-- =============================================================

insert into storage.buckets (id, name, public)
values
  ('images', 'images', false),
  ('pdfs', 'pdfs', false),
  ('audio', 'audio', false),
  ('floorplans', 'floorplans', false)
on conflict (id) do nothing;

-- Policies für storage.objects (gelten für alle vier Buckets)
drop policy if exists "storage eigene auswahl" on storage.objects;
create policy "storage eigene auswahl" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('images', 'pdfs', 'audio', 'floorplans')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage eigene einfuegen" on storage.objects;
create policy "storage eigene einfuegen" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('images', 'pdfs', 'audio', 'floorplans')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage eigene aendern" on storage.objects;
create policy "storage eigene aendern" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('images', 'pdfs', 'audio', 'floorplans')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage eigene loeschen" on storage.objects;
create policy "storage eigene loeschen" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('images', 'pdfs', 'audio', 'floorplans')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
