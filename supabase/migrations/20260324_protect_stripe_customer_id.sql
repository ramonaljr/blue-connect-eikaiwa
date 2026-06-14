-- Add stripe_customer_id to the protected-columns guard. A user could otherwise
-- point their stripe_customer_id at another customer and open that customer's
-- billing portal (createCustomerPortalSession). The checkout route now writes
-- it via the service role, which passes the guard.
create or replace function public.guard_user_protected_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
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
     or new.stripe_customer_id is distinct from old.stripe_customer_id
  then
    raise exception 'Cannot modify protected user fields' using errcode = '42501';
  end if;

  return new;
end;
$$;
