'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Layers } from 'lucide-react'
import { PhraseFlashcard } from './phrase-flashcard'
import { PhraseList } from './phrase-list'

interface PhrasesPageContentProps {
  phrases: Array<{ id: string; phrase: string; translation: string; context: string; created_at: string }>
}

export function PhrasesPageContent({ phrases: initialPhrases }: PhrasesPageContentProps) {
  const [phrases, setPhrases] = useState(initialPhrases)

  const handleDelete = (id: string) => {
    setPhrases(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">フレーズ帳</h1>
      <Tabs defaultValue="flashcard">
        <TabsList>
          <TabsTrigger value="flashcard"><Layers className="mr-1 h-4 w-4" />フラッシュカード</TabsTrigger>
          <TabsTrigger value="list"><BookOpen className="mr-1 h-4 w-4" />一覧</TabsTrigger>
        </TabsList>
        <TabsContent value="flashcard">
          <PhraseFlashcard phrases={phrases} />
        </TabsContent>
        <TabsContent value="list">
          <PhraseList phrases={phrases} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
