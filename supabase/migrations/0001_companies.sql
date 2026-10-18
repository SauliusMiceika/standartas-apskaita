-- 0001: įmonės ir naudotojų susiejimas (multi-tenant pagrindas)
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,                          -- įmonės kodas (juridinių asmenų registras)
  vat_code text,
  created_at timestamptz not null default now()
);

create table if not exists user_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','accountant','viewer')),
  created_at timestamptz not null default now(),
  unique (user_id, company_id)
);

alter table companies enable row level security;
alter table user_companies enable row level security;

-- kiekvienas mato tik savo įmones
create policy "user_companies_select_own" on user_companies
  for select using (user_id = auth.uid());
create policy "user_companies_insert_own" on user_companies
  for insert with check (user_id = auth.uid() and role = 'owner');

create policy "companies_select_member" on companies
  for select using (
    exists (select 1 from user_companies uc
            where uc.company_id = companies.id and uc.user_id = auth.uid())
  );
create policy "companies_insert_owner" on companies
  for insert with check (
    exists (select 1 from user_companies uc
            where uc.company_id = companies.id and uc.user_id = auth.uid() and uc.role = 'owner')
  );

-- service_role (naudojama serverio pusėje) turi pilną prieigą pagal nutylėjimą
