'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, RotateCcw, Eye } from 'lucide-react'

interface PhraseFlashcardProps {
  phrases: Array<{ id: string; phrase: string; translation: string; context: string }>
}

export function PhraseFlashcard({ phrases }: PhraseFlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())

  if (phrases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>保存されたフレーズがありません</p>
        <p className="text-sm mt-1">AI英会話でフレーズを保存すると、ここで復習できます</p>
      </div>
    )
  }

  const current = phrases[currentIndex]
  const progress = Math.round((reviewed.size / phrases.length) * 100)

  const next = () => {
    setReviewed(prev => new Set(prev).add(current.id))
    setShowTranslation(false)
    setCurrentIndex((currentIndex + 1) % phrases.length)
  }

  const prev = () => {
    setShowTranslation(false)
    setCurrentIndex((currentIndex - 1 + phrases.length) % phrases.length)
  }

  const reset = () => {
    setCurrentIndex(0)
    setShowTranslation(false)
    setReviewed(new Set())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {phrases.length}</span>
        <span>復習済み: {reviewed.size}/{phrases.length} ({progress}%)</span>
      </div>

      <Card className="min-h-[200px] flex items-center justify-center cursor-pointer" onClick={() => setShowTranslation(!showTranslation)}>
        <CardContent className="pt-6 text-center space-y-3">
          <p className="text-2xl font-bold">{current.phrase}</p>
          {showTranslation ? (
            <>
              <p className="text-lg text-blue-600">{current.translation}</p>
              {current.context && (
                <p className="text-sm text-muted-foreground italic">&quot;{current.context}&quot;</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Eye className="h-4 w-4" /> タップして翻訳を表示
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
        <Button onClick={next}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}
