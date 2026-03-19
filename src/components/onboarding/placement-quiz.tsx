'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CEFRLevel } from '@/lib/types/database'

interface PlacementQuizProps {
  onComplete: (level: CEFRLevel) => void
}

const QUESTIONS = [
  {
    question: 'How do you greet someone in the morning?',
    question_ja: '朝、人に会ったとき何と言いますか？',
    options: ['Good morning', 'Good evening', 'Goodbye', 'Thank you'],
    correct: 0,
    level: 'A1' as const,
  },
  {
    question: 'Choose the correct sentence:',
    question_ja: '正しい文を選んでください：',
    options: [
      "She don't like coffee.",
      "She doesn't like coffee.",
      'She not like coffee.',
      'She no like coffee.',
    ],
    correct: 1,
    level: 'A2' as const,
  },
  {
    question: 'What does "I\'ve been looking forward to it" mean?',
    question_ja: '「I\'ve been looking forward to it」の意味は？',
    options: [
      'それを探していました',
      'それを楽しみにしていました',
      'それを心配していました',
      'それを忘れていました',
    ],
    correct: 1,
    level: 'B1' as const,
  },
  {
    question: 'Complete: "Had I known about the delay, I _____ earlier."',
    question_ja: '空欄を埋めてください：',
    options: [
      'would leave',
      'would have left',
      'will leave',
      'had left',
    ],
    correct: 1,
    level: 'B2' as const,
  },
  {
    question: 'Which word best replaces "ubiquitous" in: "Smartphones have become ubiquitous in modern society."',
    question_ja: '「ubiquitous」の最適な言い換えは？',
    options: ['expensive', 'omnipresent', 'obsolete', 'dangerous'],
    correct: 1,
    level: 'C1' as const,
  },
]

export function PlacementQuiz({ onComplete }: PlacementQuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex]
    setAnswers(newAnswers)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      const correct = newAnswers.filter((a, i) => a === QUESTIONS[i].correct).length
      const levels: CEFRLevel[] = ['A1', 'A1', 'A2', 'B1', 'B2', 'C1']
      onComplete(levels[correct])
    }
  }

  const q = QUESTIONS[currentQ]

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">
          質問 {currentQ + 1} / {QUESTIONS.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{q.question}</p>
        <p className="text-sm text-muted-foreground">{q.question_ja}</p>
        <div className="space-y-2">
          {q.options.map((option, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => handleAnswer(i)}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
