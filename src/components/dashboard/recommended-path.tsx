'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Compass, ChevronRight, BookOpen, MessageSquare, Mic, Users, PenTool, type LucideIcon } from 'lucide-react'
import { getAdaptivePath } from '@/lib/actions/adaptive-path'
import Link from 'next/link'

const typeIcons: Record<string, LucideIcon> = {
  course: BookOpen, ai_chat: MessageSquare, ai_voice: Mic, tutor: Users, exercise: PenTool,
}

export function RecommendedPath() {
  const [recommendations, setRecommendations] = useState<Array<{
    type: string; title_ja: string; reason_ja: string; href: string
  }>>([])
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getAdaptivePath()
      if ('data' in result) setRecommendations(result.data)
    })
  }, [])

  if (recommendations.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Compass className="h-5 w-5 text-purple-600" />
          あなたへのおすすめ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.slice(0, 3).map((rec, i) => {
          const Icon = typeIcons[rec.type] || BookOpen
          return (
            <Link key={i} href={rec.href} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{rec.title_ja}</p>
                <p className="text-xs text-muted-foreground truncate">{rec.reason_ja}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
