import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { ProgressPageContent } from '@/components/progress/progress-page-content'

export default async function ProgressPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Fetch remaining data in parallel
  const [xpLedgerResult, monthlyXpResult] = await Promise.all([
    // XP ledger last 90 days for heatmap
    supabase
      .from('xp_ledger')
      .select('amount, created_at')
      .eq('user_id', user.id)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
    // Monthly XP entries count for study time estimate
    supabase
      .from('xp_ledger')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString()),
  ])

  // Aggregate XP ledger by date for heatmap
  const xpEntries = xpLedgerResult.data ?? []
  const heatmapMap = new Map<string, number>()
  for (const entry of xpEntries) {
    const date = entry.created_at.split('T')[0]
    heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + entry.amount)
  }
  const heatmapData = Array.from(heatmapMap.entries()).map(([date, value]) => ({
    date,
    value,
  }))

  return (
    <ProgressPageContent
      user={{
        id: user.id,
        xp: user.xp,
        level: user.level,
        streakDays: user.streak_days,
        longestStreak: user.longest_streak,
        englishLevel: user.english_level,
        lastActivityDate: user.last_activity_date,
      }}
      heatmapData={heatmapData}
      monthlyXpEntries={monthlyXpResult.count ?? 0}
    />
  )
}
