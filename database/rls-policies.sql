
create policy products_select_all
    on public.products
    for select
    to anon, authenticated
    using (true);

create policy products_admin_insert
    on public.products
    for insert
    to authenticated
    with check (public.is_admin());

create policy products_admin_update
    on public.products
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

create policy products_admin_delete
    on public.products
    for delete
    to authenticated
    using (public.is_admin());



create policy orders_select_own
    on public.orders
    for select
    to authenticated
    using (user_id = auth.uid());

create policy orders_select_admin
    on public.orders
    for select
    to authenticated
    using (public.is_admin());

create policy orders_insert_own
    on public.orders
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy orders_update_own
    on public.orders
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy orders_delete_own
    on public.orders
    for delete
    to authenticated
    using (user_id = auth.uid());


create policy user_roles_select_own
    on public.user_roles
    for select
    to authenticated
    using (user_id = auth.uid());
