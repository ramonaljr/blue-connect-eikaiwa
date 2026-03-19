import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react'

async function getAdminStats() {
  const supabase = await createClient()

  const [usersResult, tutorsResult, lessonsResult, coursesResult] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('tutor_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('lessons').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
    ])

  return {
    users: usersResult.count ?? 0,
    tutors: tutorsResult.count ?? 0,
    lessons: lessonsResult.count ?? 0,
    courses: coursesResult.count ?? 0,
  }
}

const statCards = [
  { key: 'users' as const, label: '登録ユーザー', icon: Users, color: 'text-blue-600' },
  { key: 'tutors' as const, label: 'チューター', icon: GraduationCap, color: 'text-green-600' },
  { key: 'lessons' as const, label: 'レッスン', icon: Calendar, color: 'text-purple-600' },
  { key: 'courses' as const, label: 'コース', icon: BookOpen, color: 'text-orange-600' },
]

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">管理画面</h1>
        <p className="text-muted-foreground">システム全体の概要</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats[card.key].toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
