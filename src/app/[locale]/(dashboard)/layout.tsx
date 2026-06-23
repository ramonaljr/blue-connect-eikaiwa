import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { DashboardSceneMount } from '@/components/three/dashboard-scene-mount'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let streakDays = 0
  if (authUser) {
    const { data } = await supabase
      .from('users')
      .select('streak_days')
      .eq('id', authUser.id)
      .single()
    streakDays = data?.streak_days ?? 0
  }

  return (
    // Transparent root lets the fixed WebGL canvas show through content gaps;
    // sidebar/header/cards remain opaque and paint over it.
    <div className="flex h-screen">
      <DashboardSceneMount />
      <DashboardSidebar streakDays={streakDays} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
