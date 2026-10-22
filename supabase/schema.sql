-- =============================================================================
--  Controle de Gastos — Schema multi-usuário (Supabase / PostgreSQL)
--  Rode este script INTEIRO no SQL Editor de um projeto Supabase NOVO e exclusivo.
--  O script é idempotente: pode ser executado mais de uma vez sem duplicar dados.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. TABELAS
-- -----------------------------------------------------------------------------

-- Perfil 1:1 com auth.users (criado automaticamente por trigger)
create table if not exists public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  username              text not null unique
                          check (username ~ '^[a-z]+\.[a-z]+$'),
  display_name          text not null,
  budget                numeric(12,2) not null default 0 check (budget >= 0),
  theme                 text not null default 'light' check (theme in ('light', 'dark')),
  enable_audio          boolean not null default false,
  must_change_password  boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Lançamentos de gastos — sempre vinculados ao dono (user_id)
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
                 references auth.users (id) on delete cascade,
  amount       numeric(12,2) not null check (amount > 0 and amount < 10000000),
  description  text not null check (char_length(description) between 1 and 120),
  category     text not null check (category in (
                 'alimentacao', 'mercado', 'transporte', 'saude', 'moradia',
                 'servicos', 'educacao', 'lazer', 'outro')),
  spent_on     date not null default current_date,
  created_at   timestamptz not null default now()
);

create index if not exists expenses_user_spent_on_idx
  on public.expenses (user_id, spent_on desc, created_at desc);

-- -----------------------------------------------------------------------------
-- 2. TRIGGERS
-- -----------------------------------------------------------------------------

-- updated_at automático em profiles
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Cria o perfil assim que um usuário é inserido em auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text := lower(split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    v_username,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      initcap(replace(v_username, '.', ' '))
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3. PRIVILÉGIOS (defesa em profundidade, além do RLS)
-- -----------------------------------------------------------------------------

-- Visitantes não autenticados (anon) não têm NENHUM acesso aos dados
revoke all on public.profiles from anon;
revoke all on public.expenses from anon;

-- Perfil: usuário lê o próprio perfil e só altera colunas de preferência.
-- username / display_name / id não podem ser alterados pelo cliente.
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (budget, theme, enable_audio, must_change_password)
  on public.profiles to authenticated;

-- Gastos: CRUD completo, mas sempre filtrado pelo RLS abaixo
revoke all on public.expenses from authenticated;
grant select, insert, update, delete on public.expenses to authenticated;

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY — isolamento estrito por usuário
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
-- (sem policy de INSERT/DELETE: perfis só são criados pelo trigger)

-- EXPENSES
drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own"
  on public.expenses for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own"
  on public.expenses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own"
  on public.expenses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own"
  on public.expenses for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- 5. SEED — usuários iniciais (login "nome.sobrenome" + senha padrão)
--    O app converte "nome.sobrenome" em "nome.sobrenome@corp.example.com"
--    (domínio reservado RFC 2606 — nenhum e-mail real é enviado).
-- -----------------------------------------------------------------------------

do $$
declare
  v_domain constant text := 'corp.example.com';
  v_user   record;
  v_id     uuid;
  v_email  text;
begin
  for v_user in
    select * from (values
      ('erick.rates',     '723647', 'Erick Rates'),
      ('beatriz.batista', '473612', 'Beatriz Batista'),
      ('alefe.franca',    '938430', 'Alefe França')
    ) as t(username, password, display_name)
  loop
    v_email := v_user.username || '@' || v_domain;

    if exists (select 1 from auth.users where email = v_email) then
      continue;
    end if;

    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      v_email, extensions.crypt(v_user.password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name', v_user.display_name, 'username', v_user.username),
      now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id, v_id::text,
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  end loop;
end;
$$;

-- Conferência rápida
select p.username, p.display_name, p.must_change_password, u.email
from public.profiles p
join auth.users u on u.id = p.id
order by p.username;
