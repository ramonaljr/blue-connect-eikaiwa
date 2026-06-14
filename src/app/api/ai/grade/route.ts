import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

let _anthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic()
  }
  return _anthropic
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { answer, question, referenceAnswer, level } = await request.json()

  const anthropic = getAnthropic()
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: `You are an English teacher grading a Japanese student's written response. Their CEFR level is ${level}.
Grade strictly but fairly. Return ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "corrected": "<corrected version of their answer>",
  "errors": [{"original": "<error>", "corrected": "<fix>", "type": "<grammar|vocabulary|usage>"}],
  "feedback": "<brief English feedback>",
  "feedback_ja": "<brief Japanese feedback>",
  "praise": "<one thing they did well, in Japanese>"
}`,
    messages: [{
      role: 'user',
      content: `Question: ${question}\nReference answer: ${referenceAnswer}\nStudent's answer: ${answer}\n\nGrade this response.`,
    }],
  })

  const text = response.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('')

  try {
    const result = JSON.parse(text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({
      score: 50,
      corrected: answer,
      errors: [],
      feedback: 'Unable to grade response',
      feedback_ja: '採点できませんでした',
      praise: '',
    })
  }
}
