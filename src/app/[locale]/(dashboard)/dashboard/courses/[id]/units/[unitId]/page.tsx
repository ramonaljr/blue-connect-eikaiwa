import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UnitContentRenderer } from '@/components/courses/unit-content-renderer'
import { ExerciseRenderer } from '@/components/courses/exercise-renderer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string; locale: string }>
}) {
  const { id: courseId, unitId, locale } = await params
  await requireAuth()
  const supabase = await createClient()

  // Fetch unit
  const { data: unit } = await supabase
    .from('course_units')
    .select('*')
    .eq('id', unitId)
    .eq('course_id', courseId)
    .single()

  if (!unit) notFound()

  // Fetch exercises for this unit
  const { data: exercises } = await supabase
    .from('course_exercises')
    .select('*')
    .eq('unit_id', unitId)
    .order('sort_order')

  // Fetch all units for navigation (prev/next)
  const { data: allUnits } = await supabase
    .from('course_units')
    .select('id, title, title_ja, sort_order')
    .eq('course_id', courseId)
    .order('sort_order')

  const currentIndex = allUnits?.findIndex((u) => u.id === unitId) ?? 0
  const prevUnit = currentIndex > 0 ? allUnits?.[currentIndex - 1] : null
  const nextUnit =
    allUnits && currentIndex < allUnits.length - 1
      ? allUnits[currentIndex + 1]
      : null

  const title = locale === 'ja' ? unit.title_ja : unit.title

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header with nav */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← コースに戻る
        </Link>
        <span className="text-sm text-muted-foreground">
          ユニット {currentIndex + 1}/{allUnits?.length ?? 0}
        </span>
      </div>

      <h1 className="text-2xl font-bold">{title}</h1>

      {/* Content */}
      <UnitContentRenderer content={unit.content} locale={locale} />

      {/* Exercises */}
      {exercises && exercises.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">練習問題</h2>
          <div className="text-sm text-muted-foreground">
            {exercises.length}問中 0問完了
          </div>
          {exercises.map((exercise) => (
            <ExerciseRenderer
              key={exercise.id}
              exercise={exercise}
              locale={locale}
              onComplete={() => {
                // Will be enhanced in Task 3.5 with server action
              }}
            />
          ))}
        </div>
      )}

      {/* Prev/Next navigation */}
      <div className="flex justify-between border-t pt-6">
        {prevUnit ? (
          <Link href={`/dashboard/courses/${courseId}/units/${prevUnit.id}`}>
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              前のユニット
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextUnit ? (
          <Link href={`/dashboard/courses/${courseId}/units/${nextUnit.id}`}>
            <Button>
              次のユニット
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/courses/${courseId}`}>
            <Button>コースに戻る</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
