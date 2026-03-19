import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { AIChatPageContent } from '@/components/ai/ai-chat-page-content'

export default async function AIChatPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch conversation history
  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('id, mode, scenario, scenario_key, created_at, messages')
    .eq('user_id', user.id)
    .eq('mode', 'text_chat')
    .order('created_at', { ascending: false })
    .limit(20)

  // Calculate usage remaining for free tier
  let usageRemaining = -1 // unlimited for pro/premium
  if (user.subscription_tier === 'free') {
    const todayConversations = (conversations ?? []).filter((c) => {
      const created = new Date(c.created_at)
      const today = new Date()
      return created.toDateString() === today.toDateString()
    })
    usageRemaining = Math.max(0, 3 - todayConversations.length)
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <AIChatPageContent
        conversations={conversations ?? []}
        usageRemaining={usageRemaining}
        tier={user.subscription_tier}
      />
    </div>
  )
}
