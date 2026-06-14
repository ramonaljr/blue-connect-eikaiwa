import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildTutorSystemPrompt } from '@/lib/ai/system-prompts'
import { checkAIChatLimit } from '@/lib/rate-limit'
import type { AIMessage } from '@/lib/types/database'

let _anthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic()
  }
  return _anthropic
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const limit = await checkAIChatLimit(user.id, user.subscription_tier)
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Daily chat limit reached', remaining: limit.remaining }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { messages, conversationId, scenario } = await request.json() as {
    messages: AIMessage[]
    conversationId?: string
    scenario?: string
  }

  // Input validation / cost controls: bound the number of messages and the
  // size of each one so a single request can't blow up Anthropic token cost.
  const MAX_MESSAGES = 50
  const MAX_MESSAGE_CHARS = 4000

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (messages.length > MAX_MESSAGES) {
    return new Response(JSON.stringify({ error: 'Too many messages in request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  for (const m of messages) {
    if (
      (m.role !== 'user' && m.role !== 'assistant') ||
      typeof m.content !== 'string' ||
      m.content.length === 0 ||
      m.content.length > MAX_MESSAGE_CHARS
    ) {
      return new Response(JSON.stringify({ error: 'Invalid message in request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const systemPrompt = buildTutorSystemPrompt({
    name: user.display_name || user.full_name,
    level: user.english_level,
    mode: scenario ? 'roleplay' : 'text_chat',
    scenario,
    personality: user.ai_personality,
    correctionLevel: user.ai_correction_level,
  })

  const anthropic = getAnthropic()

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: AIMessage) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            )
          }
        }

        const finalMessage = await stream.finalMessage()
        const assistantContent = finalMessage.content
          .filter((c) => c.type === 'text')
          .map((c) => c.text)
          .join('')

        const allMessages = [
          ...messages,
          { role: 'assistant' as const, content: assistantContent, timestamp: new Date().toISOString() },
        ]

        let newConversationId: string | undefined
        if (conversationId) {
          await supabase
            .from('ai_conversations')
            .update({ messages: allMessages })
            .eq('id', conversationId)
        } else {
          const { data: conv } = await supabase
            .from('ai_conversations')
            .insert({
              user_id: user.id,
              mode: 'text_chat',
              scenario: scenario ?? null,
              scenario_key: scenario ?? null,
              messages: allMessages,
            })
            .select('id')
            .single()

          newConversationId = conv?.id
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ conversationId: conv?.id })}\n\n`)
          )
        }

        // Award XP once, exactly when the conversation reaches 5 user messages.
        // awardXP is also idempotent on (user, 'ai_chat', conversationId) as a
        // backstop, so retries or batched sends can't farm repeated XP.
        const messageCount = allMessages.filter(m => m.role === 'user').length
        const convId = conversationId ?? newConversationId
        if (messageCount === 5 && convId) {
          const { awardXP } = await import('@/lib/actions/progress')
          const { updateGoalProgress } = await import('@/lib/actions/goals')
          await awardXP(user.id, 30, 'ai_chat', convId)
          await updateGoalProgress(user.id, 'ai_chats', 1)
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
