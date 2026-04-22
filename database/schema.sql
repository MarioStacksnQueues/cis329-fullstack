
create extension if not exists pgcrypto;



create table if not exists public.products (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    description     text,
    price           numeric(10, 2) not null check (price >= 0),
    category        text not null,
    image_url       text,
    stock_quantity  integer not null default 0 check (stock_quantity >= 0)
);

create index if not exists products_category_idx
    on public.products (category);



create table if not exists public.orders (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
    product_id   uuid not null references public.products (id) on delete restrict,
    quantity     integer not null check (quantity > 0),
    total_price  numeric(10, 2) not null check (total_price >= 0),
    created_at   timestamptz not null default now()
);


create index if not exists orders_user_created_idx
    on public.orders (user_id, created_at desc);


create table if not exists public.user_roles (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null unique references auth.users (id) on delete cascade,
    role        text not null default 'customer'
                check (role in ('customer', 'admin')),
    created_at  timestamptz not null default now()
);


create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.user_roles
        where user_id = auth.uid()
          and role = 'admin'
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;



create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.user_roles (user_id, role)
    values (new.id, 'customer')
    on conflict (user_id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();



alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.user_roles enable row level security;
