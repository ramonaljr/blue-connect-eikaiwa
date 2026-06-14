'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { NotepadText, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { saveLessonPrep } from '@/lib/actions/lesson-prep'

interface LessonPreparationProps {
  lessonId: string
  initialPrep?: {
    topics: string
    vocabulary: string[]
    goals: string[]
  } | null
}

const PREDEFINED_GOALS = [
  '発音を改善する',
  '会話練習をする',
  '文法を復習する',
  'リスニング力を向上させる',
  'ビジネス英語を練習する',
]

export function LessonPreparation({ lessonId, initialPrep }: LessonPreparationProps) {
  const [topics, setTopics] = useState(initialPrep?.topics ?? '')
  const [vocabulary, setVocabulary] = useState<string[]>(initialPrep?.vocabulary ?? [])
  const [goals, setGoals] = useState<string[]>(initialPrep?.goals ?? [])
  const [vocabInput, setVocabInput] = useState('')
  const [customGoalInput, setCustomGoalInput] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialMount = useRef(true)

  const doSave = useCallback(async (currentTopics: string, currentVocab: string[], currentGoals: string[]) => {
    setSaveStatus('saving')
    const result = await saveLessonPrep({
      lessonId,
      topics: currentTopics,
      vocabulary: currentVocab,
      goals: currentGoals,
    })
    if (result.error) {
      toast.error('保存に失敗しました')
      setSaveStatus('idle')
    } else {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }, [lessonId])

  // Auto-save with debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      doSave(topics, vocabulary, goals)
    }, 1000)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [topics, vocabulary, goals, doSave])

  const addVocab = () => {
    const word = vocabInput.trim()
    if (word && !vocabulary.includes(word)) {
      setVocabulary((prev) => [...prev, word])
      setVocabInput('')
    }
  }

  const removeVocab = (word: string) => {
    setVocabulary((prev) => prev.filter((v) => v !== word))
  }

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const addCustomGoal = () => {
    const goal = customGoalInput.trim()
    if (goal && !goals.includes(goal)) {
      setGoals((prev) => [...prev, goal])
      setCustomGoalInput('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotepadText className="h-5 w-5" />
          レッスン準備
          {saveStatus === 'saving' && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              保存中...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="ml-auto flex items-center gap-1 text-xs font-normal text-green-600">
              <Check className="h-3 w-3" />
              保存済み
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Topics */}
        <div className="space-y-2">
          <Label>話したいトピック</Label>
          <Textarea
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="レッスンで話したいトピックを入力してください..."
            rows={3}
          />
        </div>

        {/* Vocabulary */}
        <div className="space-y-2">
          <Label>練習したい語彙</Label>
          <div className="flex gap-2">
            <Input
              value={vocabInput}
              onChange={(e) => setVocabInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addVocab()
                }
              }}
              placeholder="単語を入力..."
              className="flex-1"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addVocab}>
              追加
            </Button>
          </div>
          {vocabulary.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {vocabulary.map((word) => (
                <Badge key={word} variant="secondary" className="gap-1 pr-1">
                  {word}
                  <button
                    type="button"
                    onClick={() => removeVocab(word)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">削除</span>
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <Label>レッスンの目標</Label>
          <div className="space-y-2">
            {PREDEFINED_GOALS.map((goal) => (
              <label key={goal} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={goals.includes(goal)}
                  onChange={() => toggleGoal(goal)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-sm">{goal}</span>
              </label>
            ))}
            {/* Show custom goals that aren't in predefined list */}
            {goals
              .filter((g) => !PREDEFINED_GOALS.includes(g))
              .map((goal) => (
                <label key={goal} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggleGoal(goal)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm">{goal}</span>
                </label>
              ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              value={customGoalInput}
              onChange={(e) => setCustomGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomGoal()
                }
              }}
              placeholder="その他の目標..."
              className="flex-1"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addCustomGoal}>
              追加
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
