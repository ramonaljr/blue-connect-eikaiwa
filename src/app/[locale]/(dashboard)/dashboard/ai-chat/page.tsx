import { requireAuth } from '@/lib/auth/guard'
import { ChatInterface } from '@/components/ai/chat-interface'

export default async function AIChatPage() {
  await requireAuth()

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatInterface />
    </div>
  )
}
