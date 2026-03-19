import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { DailyProgress } from '@/components/dashboard/daily-progress'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { ContinueLearning } from '@/components/dashboard/continue-learning'
import { UpcomingLessonCard } from '@/components/dashboard/upcoming-lesson-card'
import { WeakAreas } from '@/components/dashboard/weak-areas'
import { RecentNotifications } from '@/components/dashboard/recent-notifications'
import { NewContentCarousel } from '@/components/dashboard/new-content-carousel'
import { DailyTip } from '@/components/dashboard/daily-tip'

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch all dashboard data in parallel
  const [
    { data: nextLesson },
    { data: recentConversation },
    { data: recentCourseProgress },
    { data: notifications },
    { data: newCourses },
    { data: todayXP },
  ] = await Promise.all([
    // Next upcoming lesson with tutor info
    supabase
      .from('lessons')
      .select('*, tutor:users!lessons_tutor_id_fkey(display_name, avatar_url)')
      .eq('learner_id', user.id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at')
      .limit(1)
      .single(),
    // Most recent AI conversation
    supabase
      .from('ai_conversations')
      .select('id, mode, scenario, created_at, messages')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    // Most recent in-progress course
    supabase
      .from('learner_progress')
      .select('*, course:courses(title, title_ja, thumbnail_url)')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),
    // Unread notifications
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5),
    // Recently published courses
    supabase
      .from('courses')
      .select('id, title, title_ja, level, category, thumbnail_url')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5),
    // Today's XP from xp_ledger
    supabase
      .from('xp_ledger')
      .select('amount')
      .eq('user_id', user.id)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  const todayXPTotal = (todayXP ?? []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
  const todayMinutesEstimate = (todayXP ?? []).length * 3

  // Determine time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは'

  return (
    <div className="space-y-6">
      {/* Welcome + Daily Progress */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{greeting}、{user.display_name}さん</h1>
          <DailyTip />
        </div>
        <DailyProgress
          xp={user.xp}
          streakDays={user.streak_days}
          dailyGoalMinutes={user.daily_goal_minutes}
          todayMinutes={todayMinutesEstimate}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <ContinueLearning
            recentConversation={recentConversation}
            recentCourseProgress={recentCourseProgress}
          />
          {nextLesson && (
            <UpcomingLessonCard lesson={nextLesson} />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <WeakAreas englishLevel={user.english_level} />
          <RecentNotifications notifications={notifications ?? []} />
        </div>
      </div>

      {/* New content */}
      {newCourses && newCourses.length > 0 && (
        <NewContentCarousel courses={newCourses} />
      )}
    </div>
  )
}
