create table if not exists public.site_banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  button_href text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_banners_active_idx on public.site_banners(is_active, sort_order, created_at desc);

alter table public.site_banners enable row level security;

drop policy if exists "site_banners public read active" on public.site_banners;
create policy "site_banners public read active"
on public.site_banners
for select
using (is_active = true);

drop policy if exists "site_banners admin full access" on public.site_banners;
create policy "site_banners admin full access"
on public.site_banners
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    if not exists (select 1 from pg_trigger where tgname = 'set_site_banners_updated_at') then
      create trigger set_site_banners_updated_at
      before update on public.site_banners
      for each row execute function public.set_updated_at();
    end if;
  end if;
end $$;
