'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AudioRecorder } from '@/lib/audio/recorder'
import { AudioPlayer } from '@/lib/audio/player'

export interface TranscriptEntry {
  speaker: 'user' | 'ai'
  text: string
  timestamp: number
  pronunciationScore?: number
}

export interface PronunciationDetail {
  score: number
  phonemes: Array<{ phoneme: string; score: number; offset: number }>
  words: Array<{ word: string; score: number }>
}

export interface SessionSummary {
  duration_seconds: number
  pronunciation_score: number | null
  corrections: Array<{ original: string; corrected: string; type: string }>
  message_count: number
  mode: string
  scenario: string | null
}

interface UseVoiceSessionOptions {
  serverUrl: string // WebSocket URL
}

export function useVoiceSession(options: UseVoiceSessionOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [pronunciationScores, setPronunciationScores] = useState<
    PronunciationDetail[]
  >([])
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [slowMode, setSlowMode] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<AudioRecorder | null>(null)
  const playerRef = useRef<AudioPlayer | null>(null)

  // Initialize audio player
  useEffect(() => {
    playerRef.current = new AudioPlayer((playing) => {
      setIsAISpeaking(playing)
    })
    return () => {
      playerRef.current?.destroy()
    }
  }, [])

  const connect = useCallback(
    async (params: {
      token: string
      mode: 'voice_chat' | 'voice_immersive' | 'pronunciation_practice'
      scenario?: string
      scenarioKey?: string
      level: string
      name: string
      personality?: string
      correctionLevel?: string
    }) => {
      setError(null)
      setTranscript([])
      setPronunciationScores([])
      setSessionSummary(null)

      const ws = new WebSocket(
        `${options.serverUrl}?token=${params.token}`
      )
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            mode: params.mode,
            scenario: params.scenario,
            scenarioKey: params.scenarioKey,
            level: params.level,
            name: params.name,
            personality: params.personality ?? 'friendly',
            correctionLevel: params.correctionLevel ?? 'moderate',
          })
        )
      }

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          // Binary audio from AI
          const arrayBuffer = await event.data.arrayBuffer()
          playerRef.current?.enqueue(arrayBuffer)
          return
        }

        const message = JSON.parse(event.data as string)

        switch (message.type) {
          case 'ready':
            setIsConnected(true)
            setSessionId(message.sessionId)
            break

          case 'transcript':
            setTranscript((prev) => [
              ...prev,
              {
                speaker: 'user',
                text: message.text,
                timestamp: Date.now(),
              },
            ])
            break

          case 'response_text':
            setTranscript((prev) => [
              ...prev,
              {
                speaker: 'ai',
                text: message.text,
                timestamp: Date.now(),
              },
            ])
            break

          case 'pronunciation':
            setPronunciationScores((prev) => [
              ...prev,
              {
                score: message.score,
                phonemes: message.phonemes ?? [],
                words: message.words ?? [],
              },
            ])
            // Update the last user transcript entry with score
            setTranscript((prev) => {
              const updated = [...prev]
              for (let i = updated.length - 1; i >= 0; i--) {
                if (
                  updated[i].speaker === 'user' &&
                  !updated[i].pronunciationScore
                ) {
                  updated[i] = {
                    ...updated[i],
                    pronunciationScore: message.score,
                  }
                  break
                }
              }
              return updated
            })
            break

          case 'session_end':
            setSessionSummary(message.summary)
            setIsConnected(false)
            break

          case 'slow_mode':
            setSlowMode(message.enabled)
            break

          case 'error':
            setError(message.message)
            break
        }
      }

      ws.onerror = () => {
        setError('WebSocket connection error')
        setIsConnected(false)
      }

      ws.onclose = () => {
        setIsConnected(false)
      }
    },
    [options.serverUrl]
  )

  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const recorder = new AudioRecorder()
    recorderRef.current = recorder

    await recorder.start((blob) => {
      blob.arrayBuffer().then((buffer) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(buffer)
        }
      })
    })

    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null
    setIsRecording(false)
  }, [])

  const toggleSlowMode = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'slow_toggle' }))
    }
  }, [])

  const endSession = useCallback(() => {
    stopRecording()
    playerRef.current?.stop()
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }))
    }
  }, [stopRecording])

  const disconnect = useCallback(() => {
    stopRecording()
    playerRef.current?.stop()
    wsRef.current?.close()
    wsRef.current = null
    setIsConnected(false)
    setSessionId(null)
  }, [stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recorderRef.current?.stop()
      playerRef.current?.destroy()
      wsRef.current?.close()
    }
  }, [])

  return {
    // State
    isConnected,
    isRecording,
    isAISpeaking,
    transcript,
    pronunciationScores,
    sessionSummary,
    error,
    slowMode,
    sessionId,
    // Actions
    connect,
    startRecording,
    stopRecording,
    toggleSlowMode,
    endSession,
    disconnect,
  }
}
