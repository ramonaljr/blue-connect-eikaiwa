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

  // Fetch tutor profile, then merge public profile fields (the users table no
  // longer exposes rows to other users, so we read display info from the
  // public_profiles view instead of an embedded join).
  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('user_id', id)
    .single()

  if (!tutorProfile) notFound()

  const { data: tutorPublic } = await supabase
    .from('public_profiles')
    .select('id, display_name, avatar_url, role')
    .eq('id', id)
    .single()

  if (!tutorPublic) notFound()

  const tutor = { ...tutorProfile, user: tutorPublic }

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

  // Fetch reviews (lessons with ratings), then merge reviewer display info.
  const { data: reviewRows } = await supabase
    .from('lessons')
    .select('learner_id, learner_rating, learner_review, learner_review_categories, scheduled_at')
    .eq('tutor_id', id)
    .not('learner_rating', 'is', null)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  const reviewerIds = [...new Set((reviewRows ?? []).map((r) => r.learner_id))]
  const { data: reviewers } = reviewerIds.length
    ? await supabase
        .from('public_profiles')
        .select('id, display_name, avatar_url')
        .in('id', reviewerIds)
    : { data: [] }
  const reviewerById = new Map((reviewers ?? []).map((u) => [u.id, u]))

  const reviews = (reviewRows ?? []).map((r) => {
    const reviewer = reviewerById.get(r.learner_id)
    return {
      ...r,
      learner: { display_name: reviewer?.display_name ?? '匿名', avatar_url: reviewer?.avatar_url ?? null },
    }
  })

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
          <TutorReviews reviews={reviews} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
