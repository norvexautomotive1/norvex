create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  label text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Anyone can read public site settings"
  on public.site_settings;
create policy "Anyone can read public site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

insert into public.site_settings (key, value, label)
values
  ('phone_primary', '+40 700 000 000', 'Telefon principal'),
  ('email_primary', 'norvexautomotive1@gmail.com', 'Email principal'),
  ('address', 'Strada Principală Nr. 42, Cornu de Sus, Prahova', 'Adresă'),
  ('opening_hours', 'Luni – Sâmbătă, 09:00 – 19:00 · Duminică închis', 'Program'),
  ('instagram_url', '', 'Instagram'),
  ('tiktok_url', '', 'TikTok'),
  ('facebook_url', '', 'Facebook')
on conflict (key) do nothing;
