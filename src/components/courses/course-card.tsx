'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/lib/types/database'

interface CourseCardProps {
  course: Course
  progress?: number
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const locale = useLocale()
  const title = locale === 'ja' ? course.title_ja : course.title
  const description = locale === 'ja' ? course.description_ja : course.description

  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        {course.thumbnail_url && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={course.thumbnail_url}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          {progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
