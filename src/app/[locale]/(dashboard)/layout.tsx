import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
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
    <div className="flex h-screen bg-[oklch(0.965_0.008_250)] dark:bg-background">
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
