'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendFriendRequest(addresseeEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Resolve email -> id via SECURITY DEFINER RPC; the users table no longer
  // exposes emails to the authenticated role.
  const { data: addresseeId } = await supabase.rpc('find_user_id_by_email', {
    p_email: addresseeEmail,
  })

  if (!addresseeId) return { error: 'ユーザーが見つかりません' }
  if (addresseeId === user.id) return { error: '自分自身にリクエストは送れません' }

  const { error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: addresseeId,
  })

  if (error?.code === '23505') return { error: 'リクエスト済みです' }
  if (error) return { error: error.message }
  return { success: true }
}

export async function respondToFriendRequest(friendshipId: string, accept: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('friendships')
    .update({ status: accept ? 'accepted' : 'declined', updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getFriends() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: friendships } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted')

  const friendIds = (friendships ?? []).map(f =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  )

  const { data: profiles } = await supabase
    .from('public_profiles')
    .select('id, display_name, avatar_url, xp, streak_days')
    .in('id', friendIds)

  const byId = new Map((profiles ?? []).map(p => [p.id, p]))

  const friends = (friendships ?? []).map(f => {
    const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id
    const p = byId.get(friendId)
    return {
      id: friendId,
      display_name: p?.display_name ?? '匿名',
      avatar_url: p?.avatar_url ?? null,
      xp: p?.xp ?? 0,
      streak_days: p?.streak_days ?? 0,
      friendshipId: f.id,
    }
  })

  return { data: friends }
}

export async function getPendingRequests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: requests } = await supabase
    .from('friendships')
    .select('id, requester_id')
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  const requesterIds = (requests ?? []).map(r => r.requester_id)

  const { data: profiles } = await supabase
    .from('public_profiles')
    .select('id, display_name, avatar_url')
    .in('id', requesterIds)

  const byId = new Map((profiles ?? []).map(p => [p.id, p]))

  const data = (requests ?? []).map(r => ({
    id: r.id,
    requester: {
      display_name: byId.get(r.requester_id)?.display_name ?? '匿名',
      avatar_url: byId.get(r.requester_id)?.avatar_url ?? null,
    },
  }))

  return { data }
}
