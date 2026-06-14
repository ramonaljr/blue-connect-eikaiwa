import Anthropic from '@anthropic-ai/sdk'
import type { VoiceSession } from './session'

const anthropic = new Anthropic()

export async function generateResponse(session: VoiceSession, userText: string): Promise<string> {
  session.messages.push({ role: 'user', content: userText })

  const personalityMap: Record<string, string> = {
    friendly: 'Be warm and encouraging.',
    strict: 'Be precise and correct all errors.',
    balanced: 'Balance encouragement with corrections.',
  }

  let systemPrompt = `You are an English tutor for Japanese learners in a voice conversation.
Student: ${session.name}, CEFR Level: ${session.level}
${personalityMap[session.personality] || personalityMap.friendly}
Keep responses to 1-3 sentences (voice mode).
Correct errors gently by restating naturally.`

  if (session.mode === 'voice_immersive' && session.scenario) {
    systemPrompt += `\n\nScenario: ${session.scenario}\nStay in character. Do not break character unless the learner is confused or asks for help.`
  }

  if (session.mode === 'pronunciation_practice') {
    systemPrompt += `\n\nYou are helping with pronunciation practice. Provide clear, simple phrases for the learner to repeat. Focus on sounds Japanese speakers find difficult.`
  }

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
