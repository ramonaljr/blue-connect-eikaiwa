'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateLearningPreferences } from '@/lib/actions/settings'
import type { User, AIPersonality, AICorrectionLevel } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DAILY_GOALS = [
  { value: '10', label: '10分' },
  { value: '15', label: '15分' },
  { value: '30', label: '30分' },
  { value: '60', label: '60分' },
]

const TOPICS = [
  { value: 'travel', label: '旅行' },
  { value: 'business', label: 'ビジネス' },
  { value: 'casual', label: '日常会話' },
  { value: 'academic', label: '学術' },
  { value: 'exam_prep', label: '試験対策' },
  { value: 'technology', label: 'テクノロジー' },
  { value: 'culture', label: '文化' },
  { value: 'entertainment', label: 'エンタメ' },
]

const PERSONALITIES: { value: AIPersonality; title: string; description: string }[] = [
  { value: 'friendly', title: 'フレンドリー', description: '励ましながら楽しく教えます' },
  { value: 'strict', title: '厳格', description: '正確さを重視し、細かい間違いも指摘します' },
  { value: 'balanced', title: 'バランス', description: '状況に応じて使い分けます' },
]

const CORRECTION_LEVELS: { value: AICorrectionLevel; title: string; description: string }[] = [
  { value: 'gentle', title: 'やさしい', description: '大きな間違いだけを指摘します' },
  { value: 'moderate', title: 'ふつう', description: '一般的な間違いを指摘します' },
  { value: 'thorough', title: 'しっかり', description: 'すべての間違いを詳しく指摘します' },
]

interface LearningPreferencesFormProps {
  user: User
}

export function LearningPreferencesForm({ user }: LearningPreferencesFormProps) {
  const [dailyGoal, setDailyGoal] = useState(String(user.daily_goal_minutes))
  const [selectedTopics, setSelectedTopics] = useState<string[]>(user.preferred_topics ?? [])
  const [personality, setPersonality] = useState<AIPersonality>(user.ai_personality)
  const [correctionLevel, setCorrectionLevel] = useState<AICorrectionLevel>(user.ai_correction_level)
  const [loading, setLoading] = useState(false)

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateLearningPreferences({
        daily_goal_minutes: Number(dailyGoal),
        preferred_topics: selectedTopics,
        ai_personality: personality,
        ai_correction_level: correctionLevel,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('学習設定を更新しました')
      }
    } catch {
      toast.error('学習設定の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>学習設定</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Daily Study Goal */}
          <div className="space-y-2">
            <Label htmlFor="daily_goal">日々の学習目標</Label>
            <Select value={dailyGoal} onValueChange={(v) => v && setDailyGoal(v)}>
              <SelectTrigger id="daily_goal">
                <SelectValue placeholder="目標を選択" />
              </SelectTrigger>
              <SelectContent>
                {DAILY_GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Topics */}
          <div className="space-y-2">
            <Label>興味のあるトピック</Label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic.value)
                return (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => toggleTopic(topic.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {topic.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* AI Tutor Personality */}
          <div className="space-y-2">
            <Label>AIチューターの性格</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PERSONALITIES.map((option) => {
                const isSelected = personality === option.value
                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPersonality(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setPersonality(option.value)
                      }
                    }}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/25'
                    }`}
                  >
                    <p className="font-medium">{option.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{option.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Correction Level */}
          <div className="space-y-2">
            <Label>添削レベル</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CORRECTION_LEVELS.map((option) => {
                const isSelected = correctionLevel === option.value
                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => setCorrectionLevel(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setCorrectionLevel(option.value)
                      }
                    }}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/25'
                    }`}
                  >
                    <p className="font-medium">{option.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{option.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
