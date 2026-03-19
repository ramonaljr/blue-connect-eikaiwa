import { createClient } from '@/lib/supabase/server'
import { requireTutor } from '@/lib/auth/guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, BookOpen, Star, Clock } from 'lucide-react'

async function getTutorStats(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('tutor_profiles')
    .select('average_rating, total_lessons')
    .eq('user_id', userId)
    .single()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { data: todayLessons } = await supabase
    .from('lessons')
    .select('id, scheduled_at, duration_minutes, status, learner:users!lessons_learner_id_fkey(display_name)')
    .eq('tutor_id', userId)
    .gte('scheduled_at', todayStart.toISOString())
    .lte('scheduled_at', todayEnd.toISOString())
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_at', { ascending: true })

  return {
    averageRating: profile?.average_rating ?? 0,
    totalLessons: profile?.total_lessons ?? 0,
    todayLessonsCount: todayLessons?.length ?? 0,
    todayLessons: todayLessons ?? [],
  }
}

const statCards = [
  { key: 'todayLessonsCount' as const, label: '本日のレッスン', icon: Calendar, color: 'text-blue-600' },
  { key: 'totalLessons' as const, label: '総レッスン数', icon: BookOpen, color: 'text-green-600' },
  { key: 'averageRating' as const, label: '平均評価', icon: Star, color: 'text-yellow-600' },
]

export default async function TutorDashboardPage() {
  const user = await requireTutor()
  const stats = await getTutorStats(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">講師ダッシュボード</h1>
        <p className="text-muted-foreground">レッスンとスケジュールの概要</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {card.key === 'averageRating'
                  ? stats[card.key].toFixed(1)
                  : stats[card.key].toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.todayLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              本日のスケジュール
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.todayLessons.map((lesson) => {
                const time = new Date(lesson.scheduled_at).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const learnerName =
                  (lesson.learner as unknown as { display_name: string } | null)?.display_name ?? '不明'
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{time}</span>
                      <span className="text-sm text-muted-foreground">
                        {learnerName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {lesson.duration_minutes}分
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
