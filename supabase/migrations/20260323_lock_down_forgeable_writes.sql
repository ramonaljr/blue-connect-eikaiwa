-- ============================================================================
-- Lock down forgeable gamification/integrity writes (advisor: rls_policy_always_true)
--
-- The slice migrations created `WITH CHECK (true)` / `USING (true)` policies so
-- the app's user-context client could write these tables. Because they aren't
-- role-scoped, any authenticated user could forge rows via the API (inflate the
-- ledger-summed leaderboard, unlock achievements, etc.). Privileged writes now
-- go through the service role (see src/lib/supabase/service.ts), so we can:
--   - xp_ledger / user_achievements: remove the write policy entirely
--     (service role bypasses RLS; users keep read-own).
--   - skill_profiles / daily_tips / pronunciation_scores: scope to own rows
--     (closes cross-user forgery; legitimate own-context writes still work).
-- Plus a trigger guarding economically/privilege-sensitive users columns from
-- direct modification by the authenticated role.
-- ============================================================================

-- xp_ledger: writes only via service role (awardXP / checkAchievements).
drop policy if exists "Service can insert XP entries" on public.xp_ledger;

-- user_achievements: writes only via service role (checkAchievements).
drop policy if exists "Service can insert achievements" on public.user_achievements;

-- skill_profiles: was FOR ALL USING(true). Scope to own rows.
drop policy if exists "Service can upsert skill profiles" on public.skill_profiles;
create policy "Users manage own skill profile" on public.skill_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- daily_tips: was INSERT WITH CHECK(true). Scope to own rows.
drop policy if exists "Service role can insert tips" on public.daily_tips;
create policy "Users insert own tips" on public.daily_tips
  for insert with check (auth.uid() = user_id);

-- pronunciation_scores: was INSERT WITH CHECK(true). Scope to own rows.
-- (Server-side writers using the service role bypass RLS regardless.)
drop policy if exists "Service can insert pronunciation scores" on public.pronunciation_scores;
create policy "Users insert own pronunciation scores" on public.pronunciation_scores
  for insert with check (auth.uid() = user_id);

-- Guard protected users columns: the authenticated role may not change XP,
-- level, streak fields, role, or subscription tier/status directly. These are
-- only mutated by the service role (gamification actions, Stripe webhook).
create or replace function public.guard_user_protected_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Privileged contexts pass through: service role (PostgREST SET ROLE
  -- service_role) and superuser/admin (migrations, direct SQL).
  if current_user in ('service_role', 'postgres', 'supabase_admin')
     or coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role'
  then
    return new;
  end if;

  if new.xp is distinct from old.xp
     or new.level is distinct from old.level
     or new.streak_days is distinct from old.streak_days
     or new.longest_streak is distinct from old.longest_streak
     or new.streak_freezes_remaining is distinct from old.streak_freezes_remaining
     or new.role is distinct from old.role
     or new.subscription_tier is distinct from old.subscription_tier
     or new.subscription_status is distinct from old.subscription_status
  then
    raise exception 'Cannot modify protected user fields' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_user_protected_columns on public.users;
create trigger guard_user_protected_columns
  before update on public.users
  for each row execute function public.guard_user_protected_columns();
