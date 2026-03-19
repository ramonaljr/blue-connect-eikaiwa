'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, ChevronDown, ChevronUp, Target, Sparkles } from 'lucide-react'
import { getActiveGoals, suggestGoals, createGoal, deleteGoal } from '@/lib/actions/goals'
import type { UserGoal } from '@/lib/types/database'

export interface GoalsSectionProps {
  userId: string
  initialGoals: UserGoal[]
}

const GOAL_TYPES = [
  { value: 'study_days', label: '学習日数' },
  { value: 'exercises', label: '演習問題' },
  { value: 'voice_sessions', label: '音声セッション' },
  { value: 'ai_chats', label: 'AIチャット' },
  { value: 'lessons', label: 'レッスン' },
]

const PERIODS = [
  { value: 'weekly', label: '週間' },
  { value: 'monthly', label: '月間' },
]

export function GoalsSection({ userId, initialGoals }: GoalsSectionProps) {
  const [goals, setGoals] = useState<UserGoal[]>(initialGoals)
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof suggestGoals>>>([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Custom goal form state
  const [customTitle, setCustomTitle] = useState('')
  const [customTarget, setCustomTarget] = useState('')
  const [customType, setCustomType] = useState('study_days')
  const [customPeriod, setCustomPeriod] = useState<'weekly' | 'monthly'>('weekly')

  const activeGoals = goals.filter((g) => !g.completed_at)
  const completedGoals = goals.filter((g) => g.completed_at)

  // Fetch suggestions when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      suggestGoals(userId).then(setSuggestions)
    }
  }, [dialogOpen, userId])

  const handleCreateFromSuggestion = (suggestion: (typeof suggestions)[number]) => {
    startTransition(async () => {
      const result = await createGoal({
        title: suggestion.title,
        targetValue: suggestion.targetValue,
        goalType: suggestion.goalType,
        period: suggestion.period,
      })
      if (result.success) {
        const updated = await getActiveGoals(userId)
        setGoals(updated)
        setDialogOpen(false)
      }
    })
  }

  const handleCreateCustom = () => {
    if (!customTitle.trim() || !customTarget) return
    startTransition(async () => {
      const result = await createGoal({
        title: customTitle,
        targetValue: parseInt(customTarget, 10),
        goalType: customType,
        period: customPeriod,
      })
      if (result.success) {
        const updated = await getActiveGoals(userId)
        setGoals(updated)
        setCustomTitle('')
        setCustomTarget('')
        setDialogOpen(false)
      }
    })
  }

  const handleDelete = (goalId: string) => {
    startTransition(async () => {
      const result = await deleteGoal(goalId)
      if (result.success) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId))
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          目標
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" />
              目標を追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>新しい目標を追加</DialogTitle>
            </DialogHeader>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  おすすめ
                </p>
                <div className="space-y-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleCreateFromSuggestion(s)}
                      disabled={isPending}
                      className="w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <span className="font-medium">{s.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({GOAL_TYPES.find((t) => t.value === s.goalType)?.label} / {s.period === 'weekly' ? '週間' : '月間'})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom goal form */}
            <div className="space-y-3 border-t pt-3">
              <p className="text-sm font-medium text-muted-foreground">カスタム目標</p>
              <div className="space-y-2">
                <Label htmlFor="goal-title">タイトル</Label>
                <Input
                  id="goal-title"
                  placeholder="例: 毎日10分英語を勉強する"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="goal-target">目標値</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    min={1}
                    placeholder="10"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>種類</Label>
                  <Select value={customType} onValueChange={setCustomType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>期間</Label>
                <Select value={customPeriod} onValueChange={(v) => setCustomPeriod(v as 'weekly' | 'monthly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateCustom}
                disabled={isPending || !customTitle.trim() || !customTarget}
                className="w-full"
              >
                作成
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active goals */}
        {activeGoals.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            アクティブな目標がありません。目標を追加してモチベーションを維持しましょう！
          </p>
        )}

        {activeGoals.map((goal) => {
          const pct = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0
          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate mr-2">{goal.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground tabular-nums">
                    {goal.current_value}/{goal.target_value}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(goal.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          )
        })}

        {/* Completed goals */}
        {completedGoals.length > 0 && (
          <div className="border-t pt-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>完了した目標 ({completedGoals.length})</span>
              {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showCompleted && (
              <div className="mt-3 space-y-3">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate mr-2">{goal.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground tabular-nums">
                          {goal.current_value}/{goal.target_value}
                        </span>
                        <Badge className="bg-green-500 text-white text-xs">{'完了 \u2713'}</Badge>
                      </div>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
