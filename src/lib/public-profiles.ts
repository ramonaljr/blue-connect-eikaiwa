import type { SupabaseClient } from '@supabase/supabase-js'

// Safe, public-facing subset of a user, served by the public_profiles view.
// The users table itself is no longer readable for other users (it holds
// email / stripe_customer_id), so cross-user display info is fetched here.
export type PublicProfile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  role?: string
  xp?: number
  level?: number
  streak_days?: number
  leaderboard_opt_in?: boolean
}

// Fetches public profiles for the given user ids and returns them keyed by id.
// Null/undefined/duplicate ids are ignored; an empty input skips the query.
export async function fetchPublicProfiles(
  supabase: SupabaseClient,
  ids: (string | null | undefined)[]
): Promise<Map<string, PublicProfile>> {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))]
  if (unique.length === 0) return new Map()

  const { data } = await supabase
    .from('public_profiles')
    .select('id, display_name, avatar_url, role, xp, level, streak_days, leaderboard_opt_in')
    .in('id', unique)

  return new Map((data ?? []).map((p: PublicProfile) => [p.id, p]))
}
