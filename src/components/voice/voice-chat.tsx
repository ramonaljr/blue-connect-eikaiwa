'use client'

import { useState, useCallback, useMemo } from 'react'
import { useVoiceSession } from '@/hooks/use-voice-session'
import { ScenarioPicker } from '@/components/ai/scenario-picker'
import { WaveformVisualizer } from './waveform-visualizer'
import { TranscriptPanel } from './transcript-panel'
import { SessionSummary } from './session-summary'
import { SessionTimer } from './session-timer'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Turtle, LogOut, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ScenarioKey } from '@/lib/ai/system-prompts'

type FlowState = 'scenario_pick' | 'active' | 'summary'

interface VoiceChatProps {
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

export function VoiceChat({ user }: VoiceChatProps) {
  const [flowState, setFlowState] = useState<FlowState>('scenario_pick')
  const [currentScenario, setCurrentScenario] = useState<string | null>(null)

  const voice = useVoiceSession({ serverUrl: VOICE_SERVER_URL })

  const maxMinutes = user.tier === 'premium' ? 30 : 15

  const handleScenarioSelect = useCallback(
    async (scenarioKey: ScenarioKey | null, customTopic?: string) => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const scenario =
        scenarioKey === 'custom' ? customTopic : scenarioKey ?? undefined

      setCurrentScenario(scenario ?? null)

      await voice.connect({
        token,
        mode: 'voice_chat',
        scenario,
        scenarioKey: scenarioKey ?? undefined,
        level: user.englishLevel,
        name: user.displayName,
        personality: user.personality,
        correctionLevel: user.correctionLevel,
      })

      setFlowState('active')
    },
    [voice, user]
  )

  const handleEndSession = useCallback(() => {
    voice.endSession()
  }, [voice])

  const handlePracticeAgain = useCallback(async () => {
    voice.disconnect()
    if (currentScenario) {
      // Reconnect with same scenario
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      await voice.connect({
        token,
        mode: 'voice_chat',
        scenario: currentScenario,
        level: user.englishLevel,
        name: user.displayName,
        personality: user.personality,
        correctionLevel: user.correctionLevel,
      })
      setFlowState('active')
    } else {
      setFlowState('scenario_pick')
    }
  }, [voice, currentScenario, user])

  const handleTryDifferent = useCallback(() => {
    voice.disconnect()
    setCurrentScenario(null)
    setFlowState('scenario_pick')
  }, [voice])

  // Derive effective state: if session ended while active, show summary
  const effectiveState = useMemo(() => {
    if (voice.sessionSummary && flowState === 'active') return 'summary'
    return flowState
  }, [voice.sessionSummary, flowState])

  if (effectiveState === 'summary' && voice.sessionSummary) {
    return (
      <SessionSummary
        summary={voice.sessionSummary}
        onPracticeAgain={handlePracticeAgain}
        onTryDifferent={handleTryDifferent}
      />
    )
  }

  if (effectiveState === 'scenario_pick') {
    return <ScenarioPicker onSelect={handleScenarioSelect} />
  }

  // Active session
  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          音声チャット
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

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Waveform area */}
        <div className="flex flex-1 items-center justify-center">
          <WaveformVisualizer
            isRecording={voice.isRecording}
            isAISpeaking={voice.isAISpeaking}
          />
        </div>

        {/* Transcript sidebar — hidden on mobile */}
        <div className="hidden w-80 border-l md:block">
          <TranscriptPanel entries={voice.transcript} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 border-t px-4 py-4">
        <Button
          variant={voice.slowMode ? 'default' : 'outline'}
          size="sm"
          onClick={voice.toggleSlowMode}
          title="ゆっくり話す"
        >
          <Turtle className="mr-1.5 h-4 w-4" />
          ゆっくり
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

        <Button variant="outline" size="sm" onClick={handleEndSession}>
          <LogOut className="mr-1.5 h-4 w-4" />
          終了
        </Button>
      </div>
    </div>
  )
}
