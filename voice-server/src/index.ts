import { WebSocketServer, WebSocket } from 'ws'
import { config } from 'dotenv'
import { transcribeAudio, generateResponse, synthesizeSpeech, scorePronunciation, type VoiceSession } from './voice-pipeline'

config()

const PORT = parseInt(process.env.PORT || '8080')
const wss = new WebSocketServer({ port: PORT })

const sessions = new Map<WebSocket, VoiceSession>()

wss.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', async (data, isBinary) => {
    try {
      if (!isBinary) {
        // JSON control messages
        const message = JSON.parse(data.toString())

        if (message.type === 'start') {
          sessions.set(ws, {
            userId: message.userId,
            mode: message.mode,
            scenario: message.scenario,
            level: message.level,
            name: message.name,
            messages: [],
          })
          ws.send(JSON.stringify({ type: 'ready' }))
          return
        }

        if (message.type === 'stop') {
          const session = sessions.get(ws)
          ws.send(JSON.stringify({
            type: 'session_end',
            messages: session?.messages ?? [],
          }))
          sessions.delete(ws)
          return
        }
      } else {
        // Binary audio data
        const session = sessions.get(ws)
        if (!session) return

        const audioBuffer = Buffer.from(data as Buffer)

        // 1. Transcribe
        const transcript = await transcribeAudio(audioBuffer)
        if (!transcript) return

        ws.send(JSON.stringify({ type: 'transcript', text: transcript }))

        // 2. Get AI response
        const response = await generateResponse(session, transcript)
        ws.send(JSON.stringify({ type: 'response_text', text: response }))

        // 3. Synthesize speech
        const speechBuffer = await synthesizeSpeech(response)
        ws.send(speechBuffer)

        // 4. Pronunciation score (async, non-blocking)
        scorePronunciation(audioBuffer, transcript).then((score) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pronunciation', score }))
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
    console.log('Client disconnected')
  })
})

console.log(`Voice WebSocket server running on port ${PORT}`)
