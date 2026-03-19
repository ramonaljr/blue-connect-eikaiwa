'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlacementQuiz } from './placement-quiz'
import { GoalSetting } from './goal-setting'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { toast } from 'sonner'
import type { CEFRLevel, AIPersonality } from '@/lib/types/database'

export function OnboardingWizard() {
  const [step, setStep] = useState<'quiz' | 'goals'>('quiz')
  const [englishLevel, setEnglishLevel] = useState<CEFRLevel>('A1')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleQuizComplete = (level: CEFRLevel) => {
    setEnglishLevel(level)
    setStep('goals')
  }

  const handleGoalsComplete = (data: {
    dailyGoalMinutes: number
    preferredTopics: string[]
    aiPersonality: AIPersonality
  }) => {
    startTransition(async () => {
      const result = await completeOnboarding({
        englishLevel,
        ...data,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('設定が完了しました！')
        router.push('/dashboard/ai-chat')
      }
    })
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Blue Connect Eikaiwaへようこそ！</h1>
        <p className="mt-2 text-muted-foreground">
          {step === 'quiz'
            ? 'まずは英語レベルを確認しましょう'
            : '学習の目標を設定しましょう'}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <div className={`h-2 w-16 rounded-full ${step === 'quiz' ? 'bg-blue-500' : 'bg-blue-200'}`} />
          <div className={`h-2 w-16 rounded-full ${step === 'goals' ? 'bg-blue-500' : 'bg-blue-200'}`} />
        </div>
      </div>

      {step === 'quiz' && <PlacementQuiz onComplete={handleQuizComplete} />}
      {step === 'goals' && <GoalSetting onComplete={handleGoalsComplete} />}

      {isPending && (
        <div className="text-center text-sm text-muted-foreground">
          保存中...
        </div>
      )}
    </div>
  )
}
