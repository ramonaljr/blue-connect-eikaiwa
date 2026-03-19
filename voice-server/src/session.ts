export interface VoiceSession {
  userId: string
  sessionId: string
  mode: 'voice_chat' | 'voice_immersive' | 'pronunciation_practice'
  scenario?: string
  scenarioKey?: string
  level: string
  name: string
  personality: string
  correctionLevel: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  startedAt: number
  pronunciationScores: number[]
  corrections: Array<{ original: string; corrected: string; type: string }>
  slowMode: boolean
}

export function createSession(params: Omit<VoiceSession, 'sessionId' | 'messages' | 'startedAt' | 'pronunciationScores' | 'corrections' | 'slowMode'>): VoiceSession {
  return {
    ...params,
    sessionId: crypto.randomUUID(),
    messages: [],
    startedAt: Date.now(),
    pronunciationScores: [],
    corrections: [],
    slowMode: false,
  }
}

export function getSessionDuration(session: VoiceSession): number {
  return Math.floor((Date.now() - session.startedAt) / 1000)
}

export function generateSessionSummary(session: VoiceSession) {
  const avgScore = session.pronunciationScores.length > 0
    ? session.pronunciationScores.reduce((a, b) => a + b, 0) / session.pronunciationScores.length
    : null

  return {
    duration_seconds: getSessionDuration(session),
    pronunciation_score: avgScore,
    corrections: session.corrections,
    message_count: session.messages.length,
    mode: session.mode,
    scenario: session.scenario,
  }
}
