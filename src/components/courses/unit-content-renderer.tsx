'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VocabularyPopup } from './vocabulary-popup'
import { BookOpen } from 'lucide-react'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface ContentBlock {
  type: string
  content?: string
  title?: string
  items?: Array<{
    word: string
    reading?: string
    meaning: string
    meaning_ja?: string
    example?: string
  }>
  src?: string
  alt?: string
  caption?: string
  english?: string
  japanese?: string
}

interface UnitContentRendererProps {
  content: Record<string, unknown>
  locale: string
}

export function UnitContentRenderer({
  content,
  locale,
}: UnitContentRendererProps) {
  const blocks = (content as { blocks?: ContentBlock[] })?.blocks ?? []

  if (blocks.length === 0) {
    return <p className="text-muted-foreground">コンテンツはまだありません</p>
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <div
                key={i}
                className="prose prose-sm max-w-none dark:prose-invert"
              >
                {block.content?.split('\n\n').map((para, j) => (
                  <p
                    key={j}
                    dangerouslySetInnerHTML={{
                      __html: escapeHtml(para).replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong>$1</strong>'
                      ),
                    }}
                  />
                ))}
              </div>
            )
          case 'vocabulary':
            return (
              <div key={i} className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4" /> 語彙
                </h3>
                <div className="grid gap-2">
                  {block.items?.map((item, j) => (
                    <VocabularyPopup key={j} item={item} locale={locale} />
                  ))}
                </div>
              </div>
            )
          case 'grammar':
            return (
              <Card
                key={i}
                className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-700 dark:text-blue-300">
                    {block.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{block.content}</p>
                </CardContent>
              </Card>
            )
          case 'image':
            return (
              <figure key={i} className="text-center">
                <img
                  src={block.src}
                  alt={block.alt ?? ''}
                  className="mx-auto max-h-64 rounded-lg object-contain"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          case 'audio':
            return (
              <div key={i}>
                <audio controls className="w-full" src={block.src} />
              </div>
            )
          case 'example':
            return (
              <blockquote
                key={i}
                className="space-y-1 border-l-4 border-primary/30 pl-4"
              >
                <p className="text-sm font-medium">{block.english}</p>
                <p className="text-sm text-muted-foreground">
                  {block.japanese}
                </p>
              </blockquote>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
