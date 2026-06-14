'use client'

import type { SessionSummary as SessionSummaryType } from '@/hooks/use-voice-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PronunciationScoreBadge } from './pronunciation-score-badge'
import { Clock, MessageSquare, AlertCircle } from 'lucide-react'

interface SessionSummaryProps {
  summary: SessionSummaryType
  onPracticeAgain: () => void
  onTryDifferent: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function SessionSummary({
  summary,
  onPracticeAgain,
  onTryDifferent,
}: SessionSummaryProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">セッション完了</h2>
        <p className="mt-1 text-sm text-muted-foreground">お疲れさまでした！</p>
      </div>

      {/* Score */}
      {summary.pronunciation_score !== null && (
        <div className="flex justify-center">
          <PronunciationScoreBadge score={summary.pronunciation_score} size="md" />
        </div>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>セッション統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">会話時間</p>
                <p className="font-medium">
                  {formatDuration(summary.duration_seconds)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">メッセージ数</p>
                <p className="font-medium">{summary.message_count}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corrections */}
      {summary.corrections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              修正ポイント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {summary.corrections.map((correction, i) => (
                <li key={i} className="text-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                    <div>
                      <p>
                        <span className="line-through text-muted-foreground">
                          {correction.original}
                        </span>
                        {' → '}
                        <span className="font-medium text-green-600">
                          {correction.corrected}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {correction.type}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onPracticeAgain} className="flex-1">
          もう一度練習
        </Button>
        <Button onClick={onTryDifferent} variant="outline" className="flex-1">
          別のシナリオ
        </Button>
      </div>
    </div>
  )
}
