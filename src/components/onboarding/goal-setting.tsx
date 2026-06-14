'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AIPersonality } from '@/lib/types/database'

interface GoalSettingProps {
  onComplete: (data: {
    dailyGoalMinutes: number
    preferredTopics: string[]
    aiPersonality: AIPersonality
  }) => void
}

const DAILY_GOALS = [
  { minutes: 5, label: '5分', description: 'カジュアルに' },
  { minutes: 10, label: '10分', description: 'ちょうどいい' },
  { minutes: 15, label: '15分', description: 'しっかり' },
  { minutes: 30, label: '30分', description: '本気モード' },
]

const TOPICS = [
  { key: 'daily_conversation', label: '日常会話' },
  { key: 'business', label: 'ビジネス英語' },
  { key: 'travel', label: '旅行英語' },
  { key: 'toeic', label: 'TOEIC対策' },
  { key: 'eiken', label: '英検対策' },
  { key: 'academic', label: 'アカデミック英語' },
]

const PERSONALITIES: { key: AIPersonality; label: string; description: string }[] = [
  { key: 'friendly', label: 'フレンドリー', description: '優しく楽しく教えてくれます' },
  { key: 'balanced', label: 'バランス', description: '褒めながらもしっかり指導' },
  { key: 'strict', label: 'ストリクト', description: '厳しく正確に指導します' },
]

export function GoalSetting({ onComplete }: GoalSettingProps) {
  const [step, setStep] = useState<'minutes' | 'topics' | 'personality'>('minutes')
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10)
  const [preferredTopics, setPreferredTopics] = useState<string[]>([])
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>('friendly')

  const toggleTopic = (key: string) => {
    setPreferredTopics(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    )
  }

  if (step === 'minutes') {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>毎日の学習目標は？</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAILY_GOALS.map(g => (
            <Button
              key={g.minutes}
              variant={dailyGoalMinutes === g.minutes ? 'default' : 'outline'}
              className="w-full justify-between"
              onClick={() => { setDailyGoalMinutes(g.minutes); setStep('topics') }}
            >
              <span>{g.label}</span>
              <span className="text-sm opacity-70">{g.description}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (step === 'topics') {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>興味のあるトピックは？（複数選択可）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TOPICS.map(t => (
            <Button
              key={t.key}
              variant={preferredTopics.includes(t.key) ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => toggleTopic(t.key)}
            >
              {t.label}
            </Button>
          ))}
          <Button
            className="mt-4 w-full"
            disabled={preferredTopics.length === 0}
            onClick={() => setStep('personality')}
          >
            次へ
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>AIの性格を選んでください</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {PERSONALITIES.map(p => (
          <Button
            key={p.key}
            variant={aiPersonality === p.key ? 'default' : 'outline'}
            className="w-full flex-col items-start gap-1 h-auto py-3"
            onClick={() => setAiPersonality(p.key)}
          >
            <span className="font-medium">{p.label}</span>
            <span className="text-xs opacity-70">{p.description}</span>
          </Button>
        ))}
        <Button
          className="mt-4 w-full"
          onClick={() => onComplete({ dailyGoalMinutes, preferredTopics, aiPersonality })}
        >
          完了
        </Button>
      </CardContent>
    </Card>
  )
}
