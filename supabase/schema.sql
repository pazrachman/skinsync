-- ============================================================================
-- SkinSync — Supabase schema
-- מריצים את הקובץ הזה פעם אחת ב-SQL Editor של פרויקט ה-Supabase שלכם
-- (Supabase Dashboard → SQL Editor → New query → הדבקה → Run)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: פרופיל בסיסי לכל משתמש (נוצר אוטומטית עם ההרשמה)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user can view own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: user can update own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles: user can insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- יצירת פרופיל אוטומטית בהרשמה
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- products: "ארון הטיפוח" האישי
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  brand text,
  category text, -- סרום / קרם / מסכה / מכשיר / ניקוי וכו'
  active_ingredients text[] not null default '{}', -- למשל: {retinol, vitamin_c, niacinamide, aha, bha, spf}
  open_date date, -- תאריך פתיחה בפועל; null = טרם נפתח
  shelf_life_months integer not null default 6, -- תוקף מרגע הפתיחה (PAO)
  expiry_date_override date, -- אופציונלי: תאריך תפוגה מודפס על גבי המוצר (עוקף חישוב)
  is_device boolean not null default false, -- מכשיר (למשל מסכת LED) ולא מוצר מתכלה
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products (user_id);

alter table public.products enable row level security;

create policy "products: user can manage own" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- schedule_items: תבנית שגרה שבועית חוזרת (איזה מוצר/מכשיר, אילו ימים, בוקר/ערב)
-- ----------------------------------------------------------------------------
create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  days_of_week smallint[] not null default '{}', -- 0=ראשון ... 6=שבת
  time_of_day text not null check (time_of_day in ('morning', 'evening')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists schedule_items_user_id_idx on public.schedule_items (user_id);

alter table public.schedule_items enable row level security;

create policy "schedule_items: user can manage own" on public.schedule_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- schedule_completions: סימוני V בפועל לכל תאריך
-- ----------------------------------------------------------------------------
create table if not exists public.schedule_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  schedule_item_id uuid not null references public.schedule_items (id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique (schedule_item_id, completed_on)
);

create index if not exists schedule_completions_user_id_idx on public.schedule_completions (user_id);

alter table public.schedule_completions enable row level security;

create policy "schedule_completions: user can manage own" on public.schedule_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- maintenance_reminders: תזכורות תחזוקה/היגיינה מחזוריות (לא נמרחות על הפנים)
-- ----------------------------------------------------------------------------
create table if not exists public.maintenance_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null, -- למשל "חיטוי ציפית משי"
  notes text,
  cadence_days integer not null default 7, -- כל כמה ימים חוזרת המשימה
  last_done_on date, -- מתי בוצע לאחרונה
  created_at timestamptz not null default now()
);

create index if not exists maintenance_reminders_user_id_idx on public.maintenance_reminders (user_id);

alter table public.maintenance_reminders enable row level security;

create policy "maintenance_reminders: user can manage own" on public.maintenance_reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- סוף הסכימה
-- ============================================================================
