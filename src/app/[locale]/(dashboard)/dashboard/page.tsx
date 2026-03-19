import { requireAuth } from '@/lib/auth/guard'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const user = await requireAuth()

  return <DashboardContent userName={user.display_name} />
}
