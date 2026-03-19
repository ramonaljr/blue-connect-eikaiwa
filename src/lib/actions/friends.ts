'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendFriendRequest(addresseeEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: addressee } = await supabase
    .from('users')
    .select('id')
    .eq('email', addresseeEmail)
    .single()

  if (!addressee) return { error: 'ユーザーが見つかりません' }
  if (addressee.id === user.id) return { error: '自分自身にリクエストは送れません' }

  const { error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: addressee.id,
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
    .select('*, requester:users!friendships_requester_id_fkey(id, display_name, avatar_url, xp, streak_days), addressee:users!friendships_addressee_id_fkey(id, display_name, avatar_url, xp, streak_days)')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted')

  const friends = (friendships ?? []).map(f => {
    const friend = f.requester.id === user.id ? f.addressee : f.requester
    return { ...friend, friendshipId: f.id }
  })

  return { data: friends }
}

export async function getPendingRequests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data } = await supabase
    .from('friendships')
    .select('*, requester:users!friendships_requester_id_fkey(display_name, avatar_url)')
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  return { data: data ?? [] }
}
