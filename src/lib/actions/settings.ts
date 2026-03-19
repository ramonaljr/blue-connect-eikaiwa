'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CEFRLevel, AIPersonality, AICorrectionLevel } from '@/lib/types/database'

export async function updateProfile(data: {
  display_name: string
  full_name: string
  english_level: CEFRLevel
  timezone: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('users')
      .update({
        display_name: data.display_name,
        full_name: data.full_name,
        english_level: data.english_level,
        timezone: data.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch {
    return { error: 'Failed to update profile' }
  }
}

export async function updateAvatar(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const file = formData.get('avatar') as File | null

    if (!file) {
      return { error: 'No file provided' }
    }

    const ext = file.name.split('.').pop()
    const filePath = `avatars/${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      return { error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true, url: publicUrl }
  } catch {
    return { error: 'Failed to upload avatar' }
  }
}

export async function updateLearningPreferences(data: {
  daily_goal_minutes: number
  preferred_topics: string[]
  ai_personality: AIPersonality
  ai_correction_level: AICorrectionLevel
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('users')
      .update({
        daily_goal_minutes: data.daily_goal_minutes,
        preferred_topics: data.preferred_topics,
        ai_personality: data.ai_personality,
        ai_correction_level: data.ai_correction_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch {
    return { error: 'Failed to update learning preferences' }
  }
}

export async function updatePassword(data: { newPassword: string }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch {
    return { error: 'Failed to update password' }
  }
}

export async function getConnectedProviders() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const providers = (user.identities ?? []).map((identity) => ({
      provider: identity.provider,
      created_at: identity.created_at,
    }))

    return { success: true, providers }
  } catch {
    return { error: 'Failed to get connected providers' }
  }
}

export async function exportUserData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const [profile, conversations, progress, lessons, notifications] =
      await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('ai_conversations').select('*').eq('user_id', user.id),
        supabase.from('learner_progress').select('*').eq('user_id', user.id),
        supabase.from('lessons').select('*').eq('learner_id', user.id),
        supabase.from('notifications').select('*').eq('user_id', user.id),
      ])

    return {
      success: true,
      data: {
        profile: profile.data,
        ai_conversations: conversations.data,
        learner_progress: progress.data,
        lessons: lessons.data,
        notifications: notifications.data,
        exported_at: new Date().toISOString(),
      },
    }
  } catch {
    return { error: 'Failed to export user data' }
  }
}

export async function requestAccountDeletion() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Account Deletion Requested',
      title_ja: 'アカウント削除リクエスト',
      message:
        'Your account has been scheduled for deletion in 30 days. Contact support to cancel.',
      message_ja:
        'アカウントは30日後に削除される予定です。キャンセルするにはサポートにお問い合わせください。',
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch {
    return { error: 'Failed to request account deletion' }
  }
}
