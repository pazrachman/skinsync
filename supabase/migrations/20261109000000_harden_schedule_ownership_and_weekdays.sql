-- ============================================================================
-- Harden schedule ownership + weekday validation
--
-- 1. schedule_completions: the old "for all ... with check (auth.uid() = user_id)"
--    policy only checked the completion's own user_id. A user who knew another
--    user's schedule_items.id could insert a completion for it, and the
--    unique (schedule_item_id, completed_on) key would then block the real
--    owner from marking that day complete. The new INSERT/UPDATE policies
--    also require the referenced schedule item to belong to auth.uid().
--
-- 2. schedule_items: same class of bug for product_id — a user could attach
--    another user's product to their own schedule. INSERT/UPDATE now require
--    the referenced product (when set) to belong to auth.uid().
--
-- 3. schedule_items.days_of_week: every element must be a weekday 0..6
--    (0 = Sunday … 6 = Saturday). Values like 8 were previously saved and
--    then never appeared on the weekly dashboard.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Clean up existing invalid data BEFORE adding constraints/policies
-- ---------------------------------------------------------------------------

-- Completions whose user_id doesn't match the schedule item's owner are exactly
-- the rows the old policy wrongly allowed. Remove them so the real owner can
-- mark those days complete.
delete from public.schedule_completions c
using public.schedule_items s
where s.id = c.schedule_item_id
  and s.user_id <> c.user_id;

-- Schedule items pointing at another user's product: detach the foreign product
-- (the owner never had read access to it, so it already rendered as "deleted").
update public.schedule_items s
set product_id = null
from public.products p
where p.id = s.product_id
  and p.user_id <> s.user_id;

-- Strip out-of-range / NULL weekdays, keeping the valid ones (deduped + sorted).
update public.schedule_items
set days_of_week = coalesce(
  array(
    select distinct d
    from unnest(days_of_week) as d
    where d between 0 and 6
    order by d
  ),
  '{}'
)
where not (days_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]);

-- ---------------------------------------------------------------------------
-- Weekday CHECK constraint
-- ---------------------------------------------------------------------------
-- `<@` (is contained by) is false if any element is outside 0..6 or is NULL,
-- so this rejects 8, -1, 7 and arrays containing NULL. Non-integers (2.5) and
-- non-numeric text are already rejected by the smallint[] column type.
alter table public.schedule_items
  drop constraint if exists schedule_items_days_of_week_range;
alter table public.schedule_items
  add constraint schedule_items_days_of_week_range
  check (days_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]);

-- ---------------------------------------------------------------------------
-- schedule_completions RLS: split the catch-all policy per command
-- ---------------------------------------------------------------------------
drop policy if exists "schedule_completions: user can manage own" on public.schedule_completions;
drop policy if exists "schedule_completions: select own" on public.schedule_completions;
drop policy if exists "schedule_completions: insert own schedule" on public.schedule_completions;
drop policy if exists "schedule_completions: update own schedule" on public.schedule_completions;
drop policy if exists "schedule_completions: delete own" on public.schedule_completions;

create policy "schedule_completions: select own" on public.schedule_completions
  for select using (user_id = auth.uid());

create policy "schedule_completions: insert own schedule" on public.schedule_completions
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.schedule_items s
      where s.id = schedule_item_id
        and s.user_id = auth.uid()
    )
  );

create policy "schedule_completions: update own schedule" on public.schedule_completions
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.schedule_items s
      where s.id = schedule_item_id
        and s.user_id = auth.uid()
    )
  );

create policy "schedule_completions: delete own" on public.schedule_completions
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- schedule_items RLS: referenced product must also be the user's own
-- ---------------------------------------------------------------------------
drop policy if exists "schedule_items: user can manage own" on public.schedule_items;
drop policy if exists "schedule_items: select own" on public.schedule_items;
drop policy if exists "schedule_items: insert own product" on public.schedule_items;
drop policy if exists "schedule_items: update own product" on public.schedule_items;
drop policy if exists "schedule_items: delete own" on public.schedule_items;

create policy "schedule_items: select own" on public.schedule_items
  for select using (user_id = auth.uid());

create policy "schedule_items: insert own product" on public.schedule_items
  for insert with check (
    user_id = auth.uid()
    and (
      product_id is null
      or exists (
        select 1 from public.products p
        where p.id = product_id
          and p.user_id = auth.uid()
      )
    )
  );

create policy "schedule_items: update own product" on public.schedule_items
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      product_id is null
      or exists (
        select 1 from public.products p
        where p.id = product_id
          and p.user_id = auth.uid()
      )
    )
  );

create policy "schedule_items: delete own" on public.schedule_items
  for delete using (user_id = auth.uid());

-- Helps the EXISTS lookups in the policies above.
create index if not exists schedule_completions_schedule_item_id_idx
  on public.schedule_completions (schedule_item_id);
