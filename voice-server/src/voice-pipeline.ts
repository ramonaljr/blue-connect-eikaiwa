import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export interface VoiceSession {
  userId: string
  mode: 'voice_chat' | 'voice_immersive'
  scenario?: string
  level: string
  name: string
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // Deepgram STT
  const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'audio/webm',
    },
    body: audioBuffer as unknown as BodyInit,
  })

  const data = await res.json()
  return data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''
}

export async function generateResponse(session: VoiceSession, userText: string): Promise<string> {
  session.messages.push({ role: 'user', content: userText })

  const systemPrompt = `You are a friendly English tutor. Student: ${session.name}, Level: ${session.level}. Keep responses concise (1-3 sentences) for voice mode. Correct errors gently.${session.scenario ? ` Scenario: ${session.scenario}` : ''}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: systemPrompt,
    messages: session.messages,
  })

  const text = response.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('')

  session.messages.push({ role: 'assistant', content: text })
  return text
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function scorePronunciation(audioBuffer: Buffer, referenceText: string): Promise<number> {
  // Azure Speech pronunciation assessment
  const endpoint = `https://${process.env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY!,
      'Content-Type': 'audio/webm',
      'Pronunciation-Assessment': Buffer.from(JSON.stringify({
        ReferenceText: referenceText,
        GradingSystem: 'HundredMark',
        Granularity: 'Phoneme',
      })).toString('base64'),
    },
    body: audioBuffer as unknown as BodyInit,
  })

  const data = await res.json()
  return data.NBest?.[0]?.PronunciationAssessment?.PronScore ?? 0
}
