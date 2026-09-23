update public.program_norvex
set
  deschis = true,
  ora_start = time '09:00',
  ora_end = time '19:00'
where zi_saptamana between 1 and 6;

update public.program_norvex
set
  deschis = false
where zi_saptamana = 7;
