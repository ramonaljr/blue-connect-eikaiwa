'use client'

import { useState, useCallback, useMemo } from 'react'
import { useVoiceSession } from '@/hooks/use-voice-session'
import { PronunciationScoreBadge } from './pronunciation-score-badge'
import { SessionSummary } from './session-summary'
import { SessionTimer } from './session-timer'
import { WaveformVisualizer } from './waveform-visualizer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mic,
  MicOff,
  Volume2,
  SkipForward,
  LogOut,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type FlowState = 'idle' | 'active' | 'summary'

interface PronunciationPracticeProps {
  user: {
    id: string
    displayName: string
    englishLevel: string
    personality: string
    correctionLevel: string
    tier: string
  }
}

const VOICE_SERVER_URL =
  process.env.NEXT_PUBLIC_VOICE_SERVER_URL ?? 'ws://localhost:8080'

// Sample phrases grouped by level
const PRACTICE_PHRASES: Record<string, string[]> = {
  A1: [
    'Hello, how are you?',
    'My name is...',
    'I like coffee.',
    'Where is the station?',
    'Thank you very much.',
    'What time is it?',
    'I am a student.',
    'Nice to meet you.',
  ],
  A2: [
    'I would like to order a coffee, please.',
    'Could you tell me how to get to the library?',
    'I usually wake up at seven in the morning.',
    'What do you do for a living?',
    'The weather is really nice today.',
    'I have been studying English for two years.',
  ],
  B1: [
    'I think that learning a new language requires patience and practice.',
    'Could you explain the difference between these two options?',
    'I have been working in this field for about five years.',
    'Would you mind if I opened the window?',
    'The restaurant we went to last night had excellent service.',
  ],
  B2: [
    'If I had known about the meeting earlier, I would have prepared a presentation.',
    'The economic situation has significantly improved since last quarter.',
    'I strongly believe that education should be accessible to everyone.',
    'Despite the challenges, the team managed to deliver the project on time.',
  ],
  C1: [
    'The implications of artificial intelligence on the labor market are both promising and concerning.',
    'Had it not been for the swift intervention of the authorities, the situation could have escalated.',
    'It is imperative that we address these environmental issues before they become irreversible.',
  ],
  C2: [
    'The nuanced interplay between cultural identity and globalization presents a multifaceted challenge for contemporary societies.',
    'Notwithstanding the inherent complexities of the geopolitical landscape, diplomatic efforts have yielded tangible results.',
  ],
}

export function PronunciationPractice({ user }: PronunciationPracticeProps) {
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const voice = useVoiceSession({ serverUrl: VOICE_SERVER_URL })

  const maxMinutes = user.tier === 'premium' ? 30 : 15

  // Get phrases for user's level, fallback to B1
  const phrases =
    PRACTICE_PHRASES[user.englishLevel] ?? PRACTICE_PHRASES['B1']
  const currentPhrase = phrases[phraseIndex % phrases.length]

  // Derive latest pronunciation score from hook state
  const lastScore = useMemo(() => {
    if (voice.pronunciationScores.length === 0) return null
    return voice.pronunciationScores[voice.pronunciationScores.length - 1].score
  }, [voice.pronunciationScores])

  // Derive effective state: if session ended while active, show summary
  const effectiveState = useMemo(() => {
    if (voice.sessionSummary && flowState === 'active') return 'summary'
    return flowState
  }, [voice.sessionSummary, flowState])

  const handleStart = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    await voice.connect({
      token,
      mode: 'pronunciation_practice',
      level: user.englishLevel,
      name: user.displayName,
      personality: user.personality,
      correctionLevel: user.correctionLevel,
    })

    setFlowState('active')
  }, [voice, user])

  const handleListen = useCallback(() => {
    // Use the browser Speech Synthesis API to play the target phrase
    // This avoids needing direct WebSocket access for TTS playback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPhrase)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }, [currentPhrase])

  const handleNext = useCallback(() => {
    setPhraseIndex((prev) => prev + 1)
  }, [])

  const handleEndSession = useCallback(() => {
    voice.endSession()
  }, [voice])

  const handlePracticeAgain = useCallback(() => {
    voice.disconnect()
    setPhraseIndex(0)
    setFlowState('idle')
  }, [voice])

  if (effectiveState === 'summary' && voice.sessionSummary) {
    return (
      <SessionSummary
        summary={voice.sessionSummary}
        onPracticeAgain={handlePracticeAgain}
        onTryDifferent={handlePracticeAgain}
      />
    )
  }

  if (effectiveState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="text-center">
          <h2 className="text-xl font-bold">発音練習</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            表示されるフレーズを声に出して練習しましょう。AIがあなたの発音をスコアリングします。
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              レベル: {user.englishLevel}
            </p>
            <p className="mt-2 text-center text-lg font-medium">
              {phrases.length} フレーズを練習できます
            </p>
          </CardContent>
        </Card>

        <Button size="lg" onClick={handleStart}>
          練習を始める
        </Button>
      </div>
    )
  }

  // Active practice
  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          発音練習 — フレーズ {(phraseIndex % phrases.length) + 1} /{' '}
          {phrases.length}
        </h3>
        <SessionTimer maxMinutes={maxMinutes} />
      </div>

      {/* Error banner */}
      {voice.error && (
        <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {voice.error === 'WebSocket connection error'
              ? '接続エラーが発生しました。もう一度お試しください。'
              : voice.error}
          </span>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        {/* Target phrase */}
        <Card className="w-full max-w-lg">
          <CardContent className="py-6">
            <p className="text-center text-lg font-medium leading-relaxed md:text-xl">
              {currentPhrase}
            </p>
          </CardContent>
        </Card>

        {/* Waveform */}
        <WaveformVisualizer
          isRecording={voice.isRecording}
          isAISpeaking={voice.isAISpeaking}
        />

        {/* Score display */}
        {lastScore !== null && (
          <div className="flex flex-col items-center gap-2">
            <PronunciationScoreBadge score={lastScore} size="md" />
            <p className="text-sm text-muted-foreground">
              {lastScore >= 80
                ? '素晴らしい発音です！'
                : lastScore >= 60
                  ? 'いい調子です。もう少し練習しましょう。'
                  : 'もう一度挑戦してみましょう。'}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 border-t px-4 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleListen}
          disabled={voice.isAISpeaking}
          title="お手本を聞く"
        >
          <Volume2 className="mr-1.5 h-4 w-4" />
          聞く
        </Button>

        <Button
          size="lg"
          variant={voice.isRecording ? 'destructive' : 'default'}
          className="h-14 w-14 rounded-full p-0"
          onClick={
            voice.isRecording ? voice.stopRecording : voice.startRecording
          }
          disabled={voice.isAISpeaking}
        >
          {voice.isRecording ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          title="次のフレーズ"
        >
          <SkipForward className="mr-1.5 h-4 w-4" />
          次へ
        </Button>

        <Button variant="outline" size="sm" onClick={handleEndSession}>
          <LogOut className="mr-1.5 h-4 w-4" />
          終了
        </Button>
      </div>
    </div>
  )
}
