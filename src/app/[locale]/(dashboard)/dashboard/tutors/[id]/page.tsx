import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TutorProfileHeader } from '@/components/tutors/tutor-profile-header'
import { TutorAbout } from '@/components/tutors/tutor-about'
import { TutorSchedule } from '@/components/tutors/tutor-schedule'
import { TutorReviews } from '@/components/tutors/tutor-reviews'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch tutor profile with user info
  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select('*, user:users!tutor_profiles_user_id_fkey(id, display_name, avatar_url, role)')
    .eq('user_id', id)
    .single()

  if (!tutor) notFound()

  // Fetch availability
  const { data: availability } = await supabase
    .from('tutor_availability')
    .select('*')
    .eq('tutor_id', id)
    .order('day_of_week')

  // Fetch booked lessons (next 4 weeks)
  const now = new Date()
  const fourWeeksFromNow = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()
  const { data: bookedLessons } = await supabase
    .from('lessons')
    .select('scheduled_at, duration_minutes')
    .eq('tutor_id', id)
    .in('status', ['scheduled', 'in_progress'])
    .gte('scheduled_at', new Date().toISOString())
    .lte('scheduled_at', fourWeeksFromNow)

  // Fetch reviews (lessons with ratings)
  const { data: reviews } = await supabase
    .from('lessons')
    .select('learner_rating, learner_review, learner_review_categories, scheduled_at, learner:users!lessons_learner_id_fkey(display_name, avatar_url)')
    .eq('tutor_id', id)
    .not('learner_rating', 'is', null)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  const isCertified = tutor.user.role === 'certified_tutor'

  return (
    <div className="space-y-6">
      <TutorProfileHeader tutor={tutor} isCertified={isCertified} locale={locale} />

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">紹介</TabsTrigger>
          <TabsTrigger value="schedule">スケジュール</TabsTrigger>
          <TabsTrigger value="reviews">レビュー ({reviews?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <TutorAbout tutor={tutor} locale={locale} />
        </TabsContent>

        <TabsContent value="schedule">
          <TutorSchedule
            availability={availability ?? []}
            bookedLessons={bookedLessons ?? []}
            tutorId={id}
            learnerTimezone={user.timezone}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <TutorReviews reviews={(reviews ?? []).map((r: typeof reviews extends Array<infer T> ? T : never) => ({ ...r, learner: Array.isArray(r.learner) ? r.learner[0] : r.learner }))} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
