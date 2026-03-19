import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const { data: units } = await supabase
    .from('course_units')
    .select('*')
    .eq('course_id', id)
    .order('sort_order')

  const { data: progress } = await supabase
    .from('learner_progress')
    .select('unit_id, status, score')
    .eq('user_id', user.id)
    .eq('course_id', id)

  const progressMap = new Map(progress?.map((p) => [p.unit_id, p]) ?? [])

  const title = locale === 'ja' ? course.title_ja : course.title
  const description = locale === 'ja' ? course.description_ja : course.description

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{course.level}</Badge>
          <Badge variant="outline">{course.category}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ユニット</h2>
        {units?.map((unit, i) => {
          const unitProgress = progressMap.get(unit.id)
          const isCompleted = unitProgress?.status === 'completed'
          const unitTitle = locale === 'ja' ? unit.title_ja : unit.title

          return (
            <Link key={unit.id} href={`/dashboard/courses/${id}/units/${unit.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4">
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-base">
                      Unit {i + 1}: {unitTitle}
                    </CardTitle>
                    {unitProgress?.score && (
                      <p className="text-sm text-muted-foreground">
                        スコア: {Math.round(unitProgress.score)}%
                      </p>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
