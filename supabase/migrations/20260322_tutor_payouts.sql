-- ============================================================================
-- Tutor payouts (Stripe Connect foundation)
-- Model: 70% revenue share to the tutor, transfer created on lesson completion.
-- ============================================================================

-- Connect account state lives on the tutor profile.
alter table public.tutor_profiles
  add column if not exists stripe_connect_account_id text;
alter table public.tutor_profiles
  add column if not exists payouts_enabled boolean not null default false;

-- One payout row per completed lesson (lesson_id unique => idempotent payouts).
create table if not exists public.tutor_payouts (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null unique,
  amount integer not null,
  currency text not null default 'jpy',
  -- pending: owed but not yet transferred (e.g. tutor not onboarded)
  -- paid:    Stripe transfer created
  -- failed:  transfer attempt errored
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  stripe_transfer_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists tutor_payouts_tutor_id_idx on public.tutor_payouts (tutor_id);

alter table public.tutor_payouts enable row level security;

-- Tutors can read their own payout history. Writes happen via the service role
-- (server action), which bypasses RLS, so no insert/update policy is granted.
create policy "Tutors can view own payouts" on public.tutor_payouts
  for select using (tutor_id = auth.uid());
create policy "Admins can manage payouts" on public.tutor_payouts
  for all using (public.is_admin());

-- Expose Connect onboarding state to the tutor on their own profile row via the
-- existing tutor_profiles policies (already scoped to user_id = auth.uid()).
