-- =============================================================================
--  Teste de isolamento RLS — rode no SQL Editor DEPOIS do schema.sql.
--  Simula requisições autenticadas como erick.rates tentando acessar dados
--  de beatriz.batista. Tudo roda numa transação e é desfeito no final.
-- =============================================================================

begin;

-- IDs dos usuários
create temp table _ids on commit drop as
select
  (select id from auth.users where email = 'erick.rates@corp.example.com')     as erick,
  (select id from auth.users where email = 'beatriz.batista@corp.example.com') as beatriz;

grant select on _ids to authenticated;

-- 1) Beatriz cria um gasto
select set_config('request.jwt.claims',
  json_build_object('sub', (select beatriz from _ids), 'role', 'authenticated')::text, true);
set local role authenticated;

insert into public.expenses (amount, description, category)
values (99.90, 'Gasto privado da Beatriz', 'outro');

select 'beatriz vê os próprios gastos' as teste, count(*) as linhas from public.expenses;

-- 2) Erick tenta ler / editar / excluir os gastos da Beatriz
reset role;
select set_config('request.jwt.claims',
  json_build_object('sub', (select erick from _ids), 'role', 'authenticated')::text, true);
set local role authenticated;

select 'erick lê gastos da beatriz (esperado 0)' as teste, count(*) as linhas
from public.expenses where user_id = (select beatriz from _ids);

with u as (
  update public.expenses set amount = 1
  where user_id = (select beatriz from _ids) returning 1
) select 'erick edita gastos da beatriz (esperado 0)' as teste, count(*) as linhas from u;

with d as (
  delete from public.expenses
  where user_id = (select beatriz from _ids) returning 1
) select 'erick exclui gastos da beatriz (esperado 0)' as teste, count(*) as linhas from d;

select 'erick lê perfil da beatriz (esperado 0)' as teste, count(*) as linhas
from public.profiles where id = (select beatriz from _ids);

-- 3) Erick tenta inserir um gasto em nome da Beatriz (deve falhar com erro de RLS)
do $$
begin
  insert into public.expenses (user_id, amount, description, category)
  values ((select beatriz from _ids), 10, 'Tentativa de fraude', 'outro');
  raise exception 'FALHA: insert em nome de outro usuário foi permitido!';
exception when insufficient_privilege then
  raise notice 'OK: insert em nome de outro usuário bloqueado pelo RLS';
end;
$$;

reset role;
rollback;
