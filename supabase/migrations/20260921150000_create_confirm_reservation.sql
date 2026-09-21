create or replace function public.confirm_reservation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_record record;
begin
  if p_token is null or btrim(p_token) = '' then
    return jsonb_build_object('status', 'not_found');
  end if;

  select
    id,
    confirmed_at,
    confirmation_expires_at,
    status
  into reservation_record
  from public.rezervari_norvex
  where confirmation_token = p_token
  limit 1;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if reservation_record.confirmed_at is not null
     or reservation_record.status = 'confirmed' then
    return jsonb_build_object('status', 'already_confirmed');
  end if;

  if reservation_record.confirmation_expires_at is null
     or reservation_record.confirmation_expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  update public.rezervari_norvex
  set
    status = 'confirmed',
    confirmed_at = now()
  where id = reservation_record.id
    and confirmed_at is null
    and status = 'pending_confirmation';

  if not found then
    return jsonb_build_object('status', 'already_confirmed');
  end if;

  return jsonb_build_object('status', 'confirmed');
end;
$$;

revoke all on function public.confirm_reservation(text) from public;
grant execute on function public.confirm_reservation(text) to anon, authenticated;
