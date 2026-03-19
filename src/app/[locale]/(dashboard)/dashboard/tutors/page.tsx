import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { TutorCard } from '@/components/tutors/tutor-card'

export default async function TutorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: tutors } = await supabase
    .from('tutor_profiles')
    .select('*, user:users!tutor_profiles_user_id_fkey(display_name, avatar_url, role)')
    .eq('is_available', true)
    .eq('certification_status', 'approved')
    .order('average_rating', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">講師一覧</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tutors?.map((tutor: any) => (
          <TutorCard key={tutor.id} tutor={tutor} locale={locale} />
        ))}
        {!tutors?.length && (
          <p className="text-muted-foreground col-span-full text-center py-12">
            現在利用可能な講師はいません
          </p>
        )}
      </div>
    </div>
  )
}
