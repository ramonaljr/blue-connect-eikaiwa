import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types/database'

export async function requireAuth(): Promise<User> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    redirect('/login')
  }

  return user as User
}

export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard')
  }

  return user
}

export async function requireAdmin(): Promise<User> {
  return requireRole(['admin'])
}

export async function requireTutor(): Promise<User> {
  return requireRole(['community_tutor', 'certified_tutor', 'admin'])
}
