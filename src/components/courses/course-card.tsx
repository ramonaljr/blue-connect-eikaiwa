'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import type { Course } from '@/lib/types/database'

interface CourseCardProps {
  course: Course & { unit_count?: number }
  progress?: number
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const locale = useLocale()
  const title = locale === 'ja' ? course.title_ja : course.title
  const description = locale === 'ja' ? course.description_ja : course.description
  const isCompleted = progress === 100
  const isInProgress = progress !== undefined && progress > 0 && progress < 100

  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <Card className="relative h-full transition-shadow hover:shadow-md">
        {/* Completion overlay */}
        {isCompleted && (
          <div className="absolute inset-0 z-10 rounded-lg bg-green-500/10 flex items-center justify-center pointer-events-none">
            <Badge className="bg-green-500 text-white shadow-sm">
              <CheckCircle className="mr-1 size-3" />
              完了
            </Badge>
          </div>
        )}

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
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.category}</Badge>
            {course.unit_count != null && course.unit_count > 0 && (
              <span className="text-xs text-muted-foreground">{course.unit_count} ユニット</span>
            )}
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
          <div className="mt-4">
            {isInProgress ? (
              <Button variant="default" size="sm" className="w-full">
                続ける
              </Button>
            ) : isCompleted ? (
              <Button variant="outline" size="sm" className="w-full">
                復習する
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="w-full">
                始める
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
