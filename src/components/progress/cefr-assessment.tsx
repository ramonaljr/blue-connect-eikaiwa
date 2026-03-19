'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Award } from 'lucide-react'
import type { CEFRLevel } from '@/lib/types/database'

interface CEFRAssessmentProps {
  currentLevel: CEFRLevel
  onComplete: (newLevel: CEFRLevel) => void
}

const ASSESSMENT_QUESTIONS: Record<CEFRLevel, Array<{
  question: string; question_ja: string; options: string[]; correct: number
}>> = {
  A1: [
    { question: 'What is the past tense of "go"?', question_ja: '「go」の過去形は？', options: ['goed', 'went', 'gone', 'going'], correct: 1 },
    { question: '"I _____ a student." Choose the correct word.', question_ja: '正しい単語を選んでください。', options: ['is', 'am', 'are', 'be'], correct: 1 },
    { question: 'How do you say goodbye in English?', question_ja: '英語で別れの挨拶は？', options: ['Hello', 'Goodbye', 'Please', 'Sorry'], correct: 1 },
  ],
  A2: [
    { question: '"She _____ to the store yesterday."', question_ja: '空欄に入る正しい語は？', options: ['go', 'goes', 'went', 'going'], correct: 2 },
    { question: 'What is the opposite of "expensive"?', question_ja: '「expensive」の反対語は？', options: ['cheap', 'big', 'fast', 'heavy'], correct: 0 },
    { question: '"If it rains, I _____ stay home."', question_ja: '空欄を埋めてください。', options: ['will', 'would', 'could', 'should'], correct: 0 },
  ],
  B1: [
    { question: '"Had I known, I _____ come earlier."', question_ja: '仮定法の正しい形は？', options: ['will', 'would', 'would have', 'had'], correct: 2 },
    { question: 'What does "inevitable" mean?', question_ja: '「inevitable」の意味は？', options: ['避けられる', '避けられない', '信じられない', '考えられない'], correct: 1 },
    { question: '"The report _____ by the team last week."', question_ja: '受動態の正しい形は？', options: ['wrote', 'was wrote', 'was written', 'writing'], correct: 2 },
  ],
  B2: [
    { question: 'Choose the most formal: "Could you _____ the document?"', question_ja: '最もフォーマルな表現は？', options: ['look at', 'review', 'check out', 'see'], correct: 1 },
    { question: '"Notwithstanding the delays, ..." What does this mean?', question_ja: '「notwithstanding」の意味は？', options: ['〜のため', '〜にもかかわらず', '〜の代わりに', '〜の結果'], correct: 1 },
    { question: 'Which is correct? "Neither the CEO _____ the CFO..."', question_ja: '正しい接続は？', options: ['or', 'and', 'nor', 'but'], correct: 2 },
  ],
  C1: [
    { question: '"The committee reached a _____ decision."', question_ja: '最適な形容詞は？', options: ['unique', 'unanimous', 'universal', 'ultimate'], correct: 1 },
    { question: 'What is an "oxymoron"?', question_ja: '「oxymoron」とは？', options: ['矛盾した表現', '誇張表現', '比喩表現', '婉曲表現'], correct: 0 },
    { question: '"She spoke with such _____ that everyone was convinced."', question_ja: '最適な名詞は？', options: ['eloquence', 'elegance', 'evidence', 'emergence'], correct: 0 },
  ],
  C2: [
    { question: '"The politician\'s _____ remarks drew widespread criticism."', question_ja: '最適な形容詞は？', options: ['incendiary', 'inflammatory', 'provocative', 'all of the above'], correct: 3 },
    { question: 'Identify the syllepsis: "She lowered her standards and her neckline."', question_ja: 'この文に含まれる修辞技法は？', options: ['隠喩', '二重意味の共有', '誇張', '反語'], correct: 1 },
    { question: '"Sesquipedalian" describes someone who...', question_ja: '「sesquipedalian」の意味は？', options: ['長い言葉を使う', '二か国語を話す', '早口である', '声が大きい'], correct: 0 },
  ],
}

export function CEFRAssessment({ currentLevel, onComplete }: CEFRAssessmentProps) {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const nextLevelIndex = Math.min(levels.indexOf(currentLevel) + 1, levels.length - 1)
  const targetLevel = levels[nextLevelIndex]
  const questions = ASSESSMENT_QUESTIONS[targetLevel]

  const [currentQ, setCurrentQ] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const handleAnswer = (optionIndex: number) => {
    const isCorrect = optionIndex === questions[currentQ].correct
    const newCorrect = isCorrect ? correctCount + 1 : correctCount

    if (currentQ < questions.length - 1) {
      setCorrectCount(newCorrect)
      setCurrentQ(currentQ + 1)
    } else {
      setCorrectCount(newCorrect)
      setIsComplete(true)
      const passed = newCorrect >= 2 // 2/3 to pass
      onComplete(passed ? targetLevel : currentLevel)
    }
  }

  if (isComplete) {
    const passed = correctCount >= 2
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="pt-8 space-y-4">
          {passed ? (
            <>
              <Award className="mx-auto h-16 w-16 text-yellow-500" />
              <h2 className="text-2xl font-bold">合格！{targetLevel}に昇格！</h2>
              <p className="text-muted-foreground">{correctCount}/{questions.length} 正解</p>
            </>
          ) : (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h2 className="text-2xl font-bold">もう少し！</h2>
              <p className="text-muted-foreground">
                {correctCount}/{questions.length} 正解 — {currentLevel}で引き続き頑張りましょう
              </p>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{targetLevel} レベルアセスメント</CardTitle>
          <Badge variant="outline">{currentQ + 1}/{questions.length}</Badge>
        </div>
        <Progress value={((currentQ) / questions.length) * 100} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{questions[currentQ].question}</p>
        <p className="text-sm text-muted-foreground">{questions[currentQ].question_ja}</p>
        <div className="space-y-2">
          {questions[currentQ].options.map((opt, i) => (
            <Button key={i} variant="outline" className="w-full justify-start text-left" onClick={() => handleAnswer(i)}>
              {opt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
