create or replace function public.create_reservation(
  p_nume text,
  p_prenume text,
  p_telefon text,
  p_email text,
  p_tip_masina text,
  p_numar_masina text,
  p_categorie_serviciu text,
  p_pachet_selectat text,
  p_data_programare date,
  p_ora_programare time
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_id text;
begin
  insert into public.rezervari_norvex (
    nume,
    prenume,
    telefon,
    email,
    tip_masina,
    numar_masina,
    categorie_serviciu,
    pachet_selectat,
    data_programare,
    ora_programare
  )
  values (
    p_nume,
    p_prenume,
    p_telefon,
    p_email,
    p_tip_masina,
    p_numar_masina,
    p_categorie_serviciu,
    p_pachet_selectat,
    p_data_programare,
    p_ora_programare
  )
  returning id::text into reservation_id;

  return jsonb_build_object('id', reservation_id);
end;
$$;

revoke all on function public.create_reservation(
  text, text, text, text, text, text, text, text, date, time
) from public;

grant execute on function public.create_reservation(
  text, text, text, text, text, text, text, text, date, time
) to anon, authenticated;
