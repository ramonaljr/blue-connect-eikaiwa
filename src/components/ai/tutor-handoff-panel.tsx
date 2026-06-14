'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, ArrowRight, BookOpen } from 'lucide-react'
import { analyzeConversationWeaknesses } from '@/lib/actions/ai-handoff'
import Link from 'next/link'

interface TutorHandoffPanelProps {
  conversationId: string | null
  correctionCount: number
}

export function TutorHandoffPanel({ conversationId, correctionCount }: TutorHandoffPanelProps) {
  const [analysis, setAnalysis] = useState<{
    primaryWeakness: string
    categories: Record<string, number>
    suggestedTopics: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!conversationId || correctionCount === 0) return
    startTransition(async () => {
      const result = await analyzeConversationWeaknesses(conversationId)
      if ('data' in result) setAnalysis(result.data)
    })
  }, [conversationId, correctionCount])

  if (!analysis || correctionCount < 2) return null

  const weaknessLabels: Record<string, string> = {
    grammar: '文法', vocabulary: '語彙', pronunciation: '発音', usage: '表現',
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-blue-600" />
          講師とさらに上達しませんか？
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          今回の会話で{correctionCount}個の修正がありました。
          {analysis.suggestedTopics}
        </p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(analysis.categories).map(([type, count]) => (
            <Badge key={type} variant="secondary">
              {weaknessLabels[type] ?? type}: {count}回
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/tutors">
            <Button size="sm">
              講師を探す <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm">
              <BookOpen className="mr-1 h-4 w-4" /> 関連コースを見る
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
