'use client'

import { useState, useMemo } from 'react'
import { CourseCard } from '@/components/courses/course-card'
import { CourseFilters, type CourseFilters as CourseFiltersType } from '@/components/courses/course-filters'
import type { CEFRLevel } from '@/lib/types/database'

interface CourseData {
  id: string
  title: string
  title_ja: string
  description: string
  description_ja: string
  level: CEFRLevel
  category: string
  thumbnail_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
  unit_count?: number
}

interface CoursesPageContentProps {
  courses: CourseData[]
  progressMap: Record<string, number> // serialized from Map since it crosses server/client boundary
  userLevel: string
}

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function getRecommendedLevels(userLevel: string): string[] {
  const idx = CEFR_ORDER.indexOf(userLevel as CEFRLevel)
  if (idx === -1) return [userLevel]
  const levels = [CEFR_ORDER[idx]]
  if (idx + 1 < CEFR_ORDER.length) levels.push(CEFR_ORDER[idx + 1])
  return levels
}

function getStatusForCourse(courseId: string, progressMap: Record<string, number>): string {
  const progress = progressMap[courseId]
  if (progress === undefined) return 'not_started'
  if (progress >= 100) return 'completed'
  return 'in_progress'
}

export function CoursesPageContent({ courses, progressMap, userLevel }: CoursesPageContentProps) {
  const [filters, setFilters] = useState<CourseFiltersType>({
    levels: [],
    category: 'all',
    status: 'all',
    search: '',
    sort: 'recommended',
  })

  const recommendedLevels = useMemo(() => getRecommendedLevels(userLevel), [userLevel])

  const recommendedCourses = useMemo(() => {
    return courses.filter(c => recommendedLevels.includes(c.level))
  }, [courses, recommendedLevels])

  const filteredCourses = useMemo(() => {
    let result = courses

    // Filter by CEFR levels
    if (filters.levels.length > 0) {
      result = result.filter(c => filters.levels.includes(c.level))
    }

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(c => c.category === filters.category)
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(c => getStatusForCourse(c.id, progressMap) === filters.status)
    }

    // Filter by search
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.title_ja.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.description_ja.toLowerCase().includes(q)
      )
    }

    // Sort
    if (filters.sort === 'newest') {
      result = [...result].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else if (filters.sort === 'difficulty') {
      result = [...result].sort((a, b) =>
        CEFR_ORDER.indexOf(a.level) - CEFR_ORDER.indexOf(b.level)
      )
    }
    // 'recommended' keeps original sort_order

    return result
  }, [courses, filters, progressMap])

  const hasActiveFilters = filters.levels.length > 0 || filters.category !== 'all' || filters.status !== 'all' || filters.search.trim() !== ''

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">コース一覧</h1>

      {/* Recommended section — hidden when filters are active */}
      {!hasActiveFilters && recommendedCourses.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">おすすめ</h2>
          <p className="text-sm text-muted-foreground">
            あなたのレベル ({userLevel}) に合ったコース
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={progressMap[course.id]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="space-y-4">
        <CourseFilters onFilterChange={setFilters} />
      </section>

      {/* All Courses Grid */}
      <section className="space-y-4">
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} 件のコースが見つかりました
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={progressMap[course.id]}
            />
          ))}
        </div>
        {filteredCourses.length === 0 && (
          <p className="text-muted-foreground text-center py-12">
            条件に一致するコースが見つかりませんでした
          </p>
        )}
      </section>
    </div>
  )
}
