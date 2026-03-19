import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWeeklySummary } from '@/lib/email/send'

export async function GET(request: NextRequest) {
  // Verify cron secret (for Vercel Cron or external cron)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all users who opted in to weekly emails
  const { data: users } = await supabase
    .from('users')
    .select('id, email, display_name, streak_days, weekly_email_opt_in')
    .eq('weekly_email_opt_in', true)

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  let sentCount = 0

  for (const user of users) {
    try {
      // Get weekly stats
      const [
        { data: xpEntries },
        { count: lessonsCount },
        { data: achievements },
      ] = await Promise.all([
        supabase
          .from('xp_ledger')
          .select('amount')
          .eq('user_id', user.id)
          .gte('created_at', weekAgo),
        supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('learner_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', weekAgo),
        supabase
          .from('user_achievements')
          .select('achievement:achievements(title_ja)')
          .eq('user_id', user.id)
          .gte('unlocked_at', weekAgo),
      ])

      const xpEarned = xpEntries?.reduce((sum, e) => sum + e.amount, 0) ?? 0
      const minutesPracticed = (xpEntries?.length ?? 0) * 5 // rough estimate
      const achievementTitles = achievements
        ?.map((a: any) => a.achievement?.title_ja)
        .filter(Boolean) ?? []

      await sendWeeklySummary({
        to: user.email,
        name: user.display_name,
        streakDays: user.streak_days,
        xpEarned,
        lessonsCompleted: lessonsCount ?? 0,
        minutesPracticed,
        achievementsUnlocked: achievementTitles,
      })

      sentCount++
    } catch (err) {
      console.error(`Failed to send summary to ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent: sentCount })
}
