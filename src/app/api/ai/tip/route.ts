import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Static tips by day of week — used as fallback when AI is unavailable
const STATIC_TIPS = [
  '毎日少しずつ練習することが上達の秘訣です！',
  '英語で独り言を言ってみましょう。スピーキング力がアップします！',
  '好きな英語の歌を聴いて、歌詞を読んでみましょう。',
  '英語の映画やドラマを字幕なしで観てみましょう。',
  '新しい単語を覚えたら、すぐに文を作って使ってみましょう。',
  'AIチャットで今日学んだ表現を使ってみましょう！',
  '発音は完璧でなくても大丈夫。大切なのは伝えようとする気持ちです。',
]

function getStaticTip(): string {
  return STATIC_TIPS[new Date().getDay()]
}

async function generateAITip(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  englishLevel: string | null,
  preferredTopics: string[] | string | null,
  streakDays: number | null,
): Promise<string | null> {
  try {
    // Only attempt AI generation if the API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return null
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic()

    const level = englishLevel || 'intermediate'
    const topics = Array.isArray(preferredTopics)
      ? preferredTopics.join(', ')
      : preferredTopics || 'general English'
    const streak = streakDays || 0

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system:
        'You are an English learning advisor for Japanese learners. Generate a single concise study tip in Japanese (2-3 sentences max). Be encouraging and specific.',
      messages: [
        {
          role: 'user',
          content: `Generate a daily English study tip for a ${level} level learner. Topics they like: ${topics}. Current streak: ${streak} days.`,
        },
      ],
    })

    return message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
  } catch (error) {
    console.error('AI tip generation failed, using static fallback:', error)
    return null
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Check cache: return existing tip if already generated today
    const { data: existing } = await supabase
      .from('daily_tips')
      .select('tip_text')
      .eq('user_id', authUser.id)
      .eq('generated_for', today)
      .single()

    if (existing) {
      return NextResponse.json({ tip: existing.tip_text })
    }

    // Fetch user profile for AI personalization (non-critical)
    const { data: user } = await supabase
      .from('users')
      .select('english_level, preferred_topics, streak_days')
      .eq('id', authUser.id)
      .single()

    // Try AI generation, fall back to static tip
    const aiTip = await generateAITip(
      supabase,
      authUser.id,
      user?.english_level ?? null,
      user?.preferred_topics ?? null,
      user?.streak_days ?? null,
    )
    const tipText = aiTip || getStaticTip()

    // Cache the tip (non-blocking — don't fail if insert errors)
    await supabase
      .from('daily_tips')
      .insert({
        user_id: authUser.id,
        tip_text: tipText,
        generated_for: today,
      })
      .then(({ error }) => {
        if (error) console.error('Failed to cache daily tip:', error)
      })

    return NextResponse.json({ tip: tipText })
  } catch (error) {
    console.error('Daily tip error:', error)
    // Always return a tip, even on unexpected errors
    return NextResponse.json({ tip: getStaticTip() })
  }
}
