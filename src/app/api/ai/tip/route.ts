import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

let _anthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic()
  }
  return _anthropic
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, english_level, preferred_topics, streak_days')
      .eq('id', authUser.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Check cache: return existing tip if already generated today
    const { data: existing } = await supabase
      .from('daily_tips')
      .select('tip_text')
      .eq('user_id', user.id)
      .eq('generated_for', today)
      .single()

    if (existing) {
      return NextResponse.json({ tip: existing.tip_text })
    }

    // Generate new tip via Claude
    const anthropic = getAnthropic()
    const level = user.english_level || 'intermediate'
    const topics = Array.isArray(user.preferred_topics)
      ? user.preferred_topics.join(', ')
      : user.preferred_topics || 'general English'
    const streakDays = user.streak_days || 0

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: 'You are an English learning advisor for Japanese learners. Generate a single concise study tip in Japanese (2-3 sentences max). Be encouraging and specific.',
      messages: [
        {
          role: 'user',
          content: `Generate a daily English study tip for a ${level} level learner. Topics they like: ${topics}. Current streak: ${streakDays} days.`,
        },
      ],
    })

    const tipText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    // Cache the tip
    await supabase
      .from('daily_tips')
      .insert({
        user_id: user.id,
        tip_text: tipText,
        generated_for: today,
      })

    return NextResponse.json({ tip: tipText })
  } catch (error) {
    console.error('Daily tip generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily tip' },
      { status: 500 }
    )
  }
}
