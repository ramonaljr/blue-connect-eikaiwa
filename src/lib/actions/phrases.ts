'use server'

import { createClient } from '@/lib/supabase/server'

export async function savePhrase(data: {
  phrase: string
  translation: string
  context: string
  conversationId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('saved_phrases').insert({
    user_id: user.id,
    phrase: data.phrase,
    translation: data.translation,
    context: data.context,
    source_conversation_id: data.conversationId ?? null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getSavedPhrases(page: number = 0) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { phrases: [] }

  const limit = 20
  const { data } = await supabase
    .from('saved_phrases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  return { phrases: data ?? [] }
}

export async function deleteSavedPhrase(phraseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('saved_phrases')
    .delete()
    .eq('id', phraseId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
