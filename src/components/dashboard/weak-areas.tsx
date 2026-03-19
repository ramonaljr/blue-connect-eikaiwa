'use client'

import Link from 'next/link'
import { Sparkles, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CEFRLevel } from '@/lib/types/database'

interface WeakAreasProps {
  englishLevel: CEFRLevel
}

interface Recommendation {
  text: string
  href: string
}

function getRecommendations(level: CEFRLevel): Recommendation[] {
  switch (level) {
    case 'A1':
    case 'A2':
      return [
        { text: '基礎を固めよう — Foundationsコースがおすすめです', href: '/dashboard/courses' },
        { text: 'リスニング力を鍛えよう — AI音声で練習しましょう', href: '/dashboard/ai-voice' },
      ]
    case 'B1':
    case 'B2':
      return [
        { text: '会話力を伸ばそう — AIチャットで練習しましょう', href: '/dashboard/ai-chat' },
        { text: 'ビジネス英語に挑戦 — Business Englishコース', href: '/dashboard/courses' },
      ]
    case 'C1':
    case 'C2':
      return [
        { text: 'ディスカッション力を磨こう — Advanced Discussionコース', href: '/dashboard/courses' },
        { text: '発音を完璧に — AI音声で練習しましょう', href: '/dashboard/ai-voice' },
      ]
    default:
      return [
        { text: 'AI英会話で練習を始めましょう', href: '/dashboard/ai-chat' },
      ]
  }
}

export function WeakAreas({ englishLevel }: WeakAreasProps) {
  const recommendations = getRecommendations(englishLevel)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          おすすめ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <Link
              key={rec.text}
              href={rec.href}
              className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-muted"
            >
              <span className="flex-1">{rec.text}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
