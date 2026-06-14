'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Course {
  id: string
  title: string
  title_ja: string | null
  level: string | null
  category: string | null
  thumbnail_url: string | null
}

interface NewContentCarouselProps {
  courses: Course[]
}

export function NewContentCarousel({ courses }: NewContentCarouselProps) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">新着コース</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {courses.map((course) => (
          <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="shrink-0">
            <Card className="min-w-[200px] cursor-pointer transition-shadow hover:shadow-md">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title_ja ?? course.title}
                  className="h-24 w-full rounded-t-xl object-cover"
                />
              )}
              <CardContent className="space-y-2">
                <p className="text-sm font-medium line-clamp-2">
                  {course.title_ja ?? course.title}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {course.level && (
                    <Badge variant="secondary">{course.level}</Badge>
                  )}
                  {course.category && (
                    <Badge variant="outline">{course.category}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
