import { WebSocketServer, WebSocket } from 'ws'
import { config } from 'dotenv'
import { verifyToken } from './auth'
import { createSession, generateSessionSummary, type VoiceSession } from './session'
import { transcribeAudio } from './deepgram'
import { generateResponse } from './claude'
import { synthesizeSpeech } from './elevenlabs'
import { scorePronunciation } from './azure-speech'

config()

const PORT = parseInt(process.env.PORT || '8080')
const wss = new WebSocketServer({ port: PORT })

const sessions = new Map<WebSocket, VoiceSession>()

wss.on('connection', async (ws, req) => {
  // Auth: extract token from query string
  const url = new URL(req.url ?? '', `http://localhost:${PORT}`)
  const token = url.searchParams.get('token')

  if (!token) {
    ws.close(4001, 'Missing auth token')
    return
  }

  const auth = await verifyToken(token)
  if (!auth) {
    ws.close(4003, 'Invalid auth token')
    return
  }

  console.log(`Client connected: ${auth.userId}`)

  ws.on('message', async (data, isBinary) => {
    try {
      if (!isBinary) {
        const message = JSON.parse(data.toString())

        if (message.type === 'start') {
          const session = createSession({
            userId: auth.userId,
            mode: message.mode ?? 'voice_chat',
            scenario: message.scenario,
            scenarioKey: message.scenarioKey,
            level: message.level ?? 'A2',
            name: message.name ?? 'Learner',
            personality: message.personality ?? 'friendly',
            correctionLevel: message.correctionLevel ?? 'moderate',
          })
          sessions.set(ws, session)
          ws.send(JSON.stringify({ type: 'ready', sessionId: session.sessionId }))
          return
        }

        if (message.type === 'slow_toggle') {
          const session = sessions.get(ws)
          if (session) session.slowMode = !session.slowMode
          ws.send(JSON.stringify({ type: 'slow_mode', enabled: session?.slowMode ?? false }))
          return
        }

        if (message.type === 'stop') {
          const session = sessions.get(ws)
          if (session) {
            const summary = generateSessionSummary(session)
            ws.send(JSON.stringify({ type: 'session_end', summary }))

            // Award XP via direct Supabase insert
            try {
              const { createClient } = await import('@supabase/supabase-js')
              const supabase = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
              )

              // Insert XP ledger entry
              const xpAmount = session.mode === 'pronunciation_practice' ? 30 : 50
              await supabase.from('xp_ledger').insert({
                user_id: session.userId,
                amount: xpAmount,
                source: session.mode === 'pronunciation_practice' ? 'pronunciation_drill' : 'ai_voice',
              })

              // Update user XP
              const { data: user } = await supabase
                .from('users')
                .select('xp, level, streak_days, last_activity_date')
                .eq('id', session.userId)
                .single()

              if (user) {
                const newXP = user.xp + xpAmount
                const today = new Date().toISOString().split('T')[0]
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

                let newStreak = user.streak_days
                if (user.last_activity_date !== today) {
                  newStreak = user.last_activity_date === yesterday ? user.streak_days + 1 : 1
                }

                await supabase.from('users').update({
                  xp: newXP,
                  level: Math.floor(newXP / 1000) + 1,
                  streak_days: newStreak,
                  last_activity_date: today,
                }).eq('id', session.userId)
              }
            } catch (err) {
              console.error('Failed to award XP:', err)
            }
          }
          sessions.delete(ws)
          return
        }
      } else {
        // Binary audio data
        const session = sessions.get(ws)
        if (!session) return

        const audioBuffer = Buffer.from(data as Buffer)

        if (session.mode === 'pronunciation_practice') {
          // Pronunciation mode: just score, no AI response
          const transcript = await transcribeAudio(audioBuffer)
          if (!transcript) return

          ws.send(JSON.stringify({ type: 'transcript', text: transcript }))

          scorePronunciation(audioBuffer, transcript).then((result) => {
            if (ws.readyState === WebSocket.OPEN) {
              session.pronunciationScores.push(result.overallScore)
              ws.send(JSON.stringify({
                type: 'pronunciation',
                score: result.overallScore,
                phonemes: result.phonemes,
                words: result.words,
              }))
            }
          })
          return
        }

        // Voice chat / immersive: full pipeline
        const transcript = await transcribeAudio(audioBuffer)
        if (!transcript) return

        ws.send(JSON.stringify({ type: 'transcript', text: transcript }))

        const response = await generateResponse(session, transcript)
        ws.send(JSON.stringify({ type: 'response_text', text: response }))

        const speechBuffer = await synthesizeSpeech(response, session.slowMode)
        ws.send(speechBuffer)

        // Pronunciation score (async)
        scorePronunciation(audioBuffer, transcript).then((result) => {
          if (ws.readyState === WebSocket.OPEN) {
            session.pronunciationScores.push(result.overallScore)
            ws.send(JSON.stringify({
              type: 'pronunciation',
              score: result.overallScore,
              phonemes: result.phonemes,
              words: result.words,
            }))
          }
        })
      }
    } catch (err) {
      console.error('Error processing message:', err)
      ws.send(JSON.stringify({ type: 'error', message: 'Processing error' }))
    }
  })

  ws.on('close', () => {
    sessions.delete(ws)
    console.log(`Client disconnected: ${auth.userId}`)
  })
})

console.log(`Voice WebSocket server running on port ${PORT}`)
