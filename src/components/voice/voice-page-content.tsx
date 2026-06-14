'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { VoiceChat } from './voice-chat'
import { ImmersiveRoleplay } from './immersive-roleplay'
import { PronunciationPractice } from './pronunciation-practice'
import { Mic, Theater, BookOpen } from 'lucide-react'

interface VoicePageContentProps {
  user: {
    id: string
    displayName: string
    englishLevel: string
    personality: string
    correctionLevel: string
    tier: string
  }
}

export function VoicePageContent({ user }: VoicePageContentProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">AI音声練習</h1>
        <p className="text-sm text-muted-foreground">
          AIと英語で会話し、発音スコアをリアルタイムで確認できます
        </p>
      </div>

      <Tabs defaultValue="voice_chat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="voice_chat">
            <Mic className="mr-1.5 h-4 w-4" />
            音声チャット
          </TabsTrigger>
          <TabsTrigger value="immersive">
            <Theater className="mr-1.5 h-4 w-4" />
            ロールプレイ
          </TabsTrigger>
          <TabsTrigger value="pronunciation">
            <BookOpen className="mr-1.5 h-4 w-4" />
            発音練習
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice_chat">
          <VoiceChat user={user} />
        </TabsContent>

        <TabsContent value="immersive">
          <ImmersiveRoleplay user={user} />
        </TabsContent>

        <TabsContent value="pronunciation">
          <PronunciationPractice user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
