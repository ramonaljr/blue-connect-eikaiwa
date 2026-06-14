import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { TutorsPageContent } from '@/components/tutors/tutors-page-content'

export default async function TutorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('is_available', true)
    .eq('certification_status', 'approved')
    .order('average_rating', { ascending: false })

  // Merge display fields from the public_profiles view (users is no longer
  // readable for other users).
  const userIds = (profiles ?? []).map((p) => p.user_id)
  const { data: publicProfiles } = userIds.length
    ? await supabase
        .from('public_profiles')
        .select('id, display_name, avatar_url, role')
        .in('id', userIds)
    : { data: [] }
  const byId = new Map((publicProfiles ?? []).map((u) => [u.id, u]))

  const tutors = (profiles ?? [])
    .map((p) => ({ ...p, user: byId.get(p.user_id) }))
    .filter((t): t is typeof t & { user: NonNullable<typeof t.user> } => Boolean(t.user))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">講師一覧</h1>
      <TutorsPageContent tutors={tutors} locale={locale} />
    </div>
  )
}
