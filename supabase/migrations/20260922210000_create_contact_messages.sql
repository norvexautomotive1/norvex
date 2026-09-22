alter table public.contacturi_norvex
  add column if not exists email text,
  add column if not exists telefon text,
  add column if not exists tip_firma text,
  add column if not exists mesaj text,
  add column if not exists status text not null default 'nou',
  add column if not exists responded_at timestamptz;

drop function if exists public.create_contact_message(
  text, text, text, text, boolean, text, text
);

create or replace function public.create_contact_message(
  p_nume text,
  p_prenume text,
  p_email text,
  p_telefon text,
  p_este_firma boolean,
  p_tip_firma text,
  p_motiv text,
  p_mesaj text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  contact_id uuid;
begin
  if nullif(btrim(p_nume), '') is null
     or nullif(btrim(p_prenume), '') is null
     or nullif(btrim(p_email), '') is null
     or nullif(btrim(p_mesaj), '') is null then
    raise exception 'Câmpurile obligatorii nu sunt completate';
  end if;

  insert into public.contacturi_norvex (
    nume,
    prenume,
    este_firma,
    tip_firma,
    motiv,
    email,
    telefon,
    mesaj
  )
  values (
    btrim(p_nume),
    btrim(p_prenume),
    coalesce(p_este_firma, false),
    case
      when coalesce(p_este_firma, false)
        then nullif(btrim(p_tip_firma), '')
      else null
    end,
    nullif(btrim(p_motiv), ''),
    lower(btrim(p_email)),
    nullif(btrim(p_telefon), ''),
    btrim(p_mesaj)
  )
  returning id into contact_id;

  return jsonb_build_object('id', contact_id);
end;
$$;

revoke all on function public.create_contact_message(
  text, text, text, text, boolean, text, text, text
) from public;

grant execute on function public.create_contact_message(
  text, text, text, text, boolean, text, text, text
) to anon, authenticated;
