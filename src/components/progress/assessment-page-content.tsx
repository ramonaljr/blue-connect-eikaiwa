'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CEFRAssessment } from './cefr-assessment'
import { toast } from 'sonner'
import type { CEFRLevel } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

export function AssessmentPageContent({ currentLevel, userId }: { currentLevel: CEFRLevel; userId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleComplete = (newLevel: CEFRLevel) => {
    if (newLevel !== currentLevel) {
      startTransition(async () => {
        const supabase = createClient()
        await supabase.from('users').update({ english_level: newLevel }).eq('id', userId)
        toast.success(`${newLevel}に昇格しました！`)
        router.push('/dashboard/progress')
      })
    } else {
      toast.info(`引き続き${currentLevel}で頑張りましょう！`)
      setTimeout(() => router.push('/dashboard/progress'), 2000)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-center">CEFRレベルアセスメント</h1>
        <p className="text-center text-muted-foreground">現在のレベル: {currentLevel}</p>
        <CEFRAssessment currentLevel={currentLevel} onComplete={handleComplete} />
      </div>
    </div>
  )
}
