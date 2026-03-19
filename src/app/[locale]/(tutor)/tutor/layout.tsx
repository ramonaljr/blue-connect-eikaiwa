import { requireTutor } from '@/lib/auth/guard'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { TutorSidebar } from '@/components/layout/tutor-sidebar'

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireTutor()

  return (
    <div className="flex h-screen">
      <TutorSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
