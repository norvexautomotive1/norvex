alter table public.rezervari_norvex enable row level security;

drop policy if exists "Authenticated users can read reservations"
  on public.rezervari_norvex;
create policy "Authenticated users can read reservations"
  on public.rezervari_norvex
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can update reservations"
  on public.rezervari_norvex;
create policy "Authenticated users can update reservations"
  on public.rezervari_norvex
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete reservations"
  on public.rezervari_norvex;
create policy "Authenticated users can delete reservations"
  on public.rezervari_norvex
  for delete
  to authenticated
  using (true);
