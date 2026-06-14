-- ============================================================================
-- Security, money-flow, and gamification-integrity hardening
-- Addresses audit findings:
--   P0-1  users table leaked PII (email, stripe_customer_id) via USING(true)
--   P0-2  non-atomic credit spend in lesson booking
--   P0-3  no double-booking guard on tutor slots
--   P1-4  XP farming via non-idempotent xp_ledger
-- ============================================================================

-- ----------------------------------------------------------------------------
-- P0-1: Restrict the users table and expose only safe fields via a view
-- ----------------------------------------------------------------------------

-- Drop the blanket public-read policy. RLS cannot filter columns, so
-- `USING (true)` exposed email / stripe_customer_id / subscription_* to anyone
-- holding the anon key. Owner + admin policies (defined in 00002) remain.
drop policy if exists "Public can view basic user info" on public.users;

-- Public-safe projection of the users table. Owned by the migration role
-- (postgres) with security_invoker = false, so it bypasses users RLS and
-- returns rows for everyone -- but only the non-sensitive columns below.
create or replace view public.public_profiles
with (security_invoker = false) as
  select
    id,
    display_name,
    avatar_url,
    role,
    xp,
    level,
    streak_days,
    leaderboard_opt_in
  from public.users;

grant select on public.public_profiles to anon, authenticated;

-- Friend-add needs to resolve an email -> user id without exposing emails.
-- SECURITY DEFINER keeps the lookup server-side and column-safe.
create or replace function public.find_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

grant execute on function public.find_user_id_by_email(text) to authenticated;

-- ----------------------------------------------------------------------------
-- P0-2 / P0-3: Atomic, race-safe lesson booking
-- ----------------------------------------------------------------------------

create or replace function public.book_lesson(
  p_tutor_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes smallint
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_learner_id uuid := auth.uid();
  v_tutor_role user_role;
  v_credit_type credit_type;
  v_credit_id uuid;
  v_lesson_id uuid;
  v_end_at timestamptz := p_scheduled_at + make_interval(mins => p_duration_minutes);
begin
  if v_learner_id is null then
    raise exception 'UNAUTHORIZED' using errcode = '28000';
  end if;

  if p_duration_minutes not in (25, 50) then
    raise exception 'INVALID_DURATION' using errcode = '22023';
  end if;

  if p_scheduled_at <= now() then
    raise exception 'SCHEDULED_IN_PAST' using errcode = '22023';
  end if;

  select role into v_tutor_role from public.users where id = p_tutor_id;
  if v_tutor_role is null or v_tutor_role not in ('community_tutor', 'certified_tutor') then
    raise exception 'TUTOR_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_credit_type := case
    when v_tutor_role = 'certified_tutor' then 'lesson_certified'::credit_type
    else 'lesson_community'::credit_type
  end;

  -- Serialize concurrent bookings for the same tutor + slot so the
  -- overlap check and insert below act as one critical section.
  perform pg_advisory_xact_lock(hashtextextended(p_tutor_id::text || p_scheduled_at::text, 0));

  -- Double-booking guard: reject overlap with the tutor's active lessons.
  if exists (
    select 1 from public.lessons l
    where l.tutor_id = p_tutor_id
      and l.status in ('scheduled', 'in_progress')
      and tstzrange(l.scheduled_at, l.scheduled_at + make_interval(mins => l.duration_minutes))
          && tstzrange(p_scheduled_at, v_end_at)
  ) then
    raise exception 'SLOT_TAKEN' using errcode = '23P01';
  end if;

  -- Atomically claim one non-expired credit (FOR UPDATE prevents a concurrent
  -- booking from spending the same credit twice).
  select id into v_credit_id
  from public.credits
  where user_id = v_learner_id
    and type = v_credit_type
    and amount > 0
    and expires_at > now()
  order by expires_at
  limit 1
  for update skip locked;

  if v_credit_id is null then
    raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001';
  end if;

  update public.credits set amount = amount - 1 where id = v_credit_id;

  insert into public.lessons (learner_id, tutor_id, scheduled_at, duration_minutes)
  values (v_learner_id, p_tutor_id, p_scheduled_at, p_duration_minutes)
  returning id into v_lesson_id;

  insert into public.notifications (user_id, type, title, body, action_url)
  values
    (v_learner_id, 'lesson_reminder', 'レッスン予約完了',
     'レッスンが予約されました', '/dashboard/lessons/' || v_lesson_id),
    (p_tutor_id, 'lesson_reminder', '新しいレッスン予約',
     '新しいレッスンが予約されました', '/tutor/lessons/' || v_lesson_id);

  return v_lesson_id;
end;
$$;

grant execute on function public.book_lesson(uuid, timestamptz, smallint) to authenticated;

-- ----------------------------------------------------------------------------
-- P1-5: Stripe webhook idempotency ledger
-- ----------------------------------------------------------------------------

create table if not exists public.processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Service-role only: enable RLS with no policies so the anon/authenticated
-- roles cannot read or write it; the webhook uses the service-role key.
alter table public.processed_stripe_events enable row level security;

-- ----------------------------------------------------------------------------
-- P1-4: XP idempotency -- stop farming the same source repeatedly
-- ----------------------------------------------------------------------------

-- Remove any duplicate ledger rows already farmed, keeping the earliest.
delete from public.xp_ledger a
using public.xp_ledger b
where a.source_id is not null
  and a.user_id = b.user_id
  and a.source = b.source
  and a.source_id = b.source_id
  and a.ctid > b.ctid;

create unique index if not exists xp_ledger_user_source_source_id_uniq
  on public.xp_ledger (user_id, source, source_id)
  where source_id is not null;
