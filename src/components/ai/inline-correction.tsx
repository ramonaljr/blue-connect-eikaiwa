'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import type { AICorrection } from '@/lib/types/database'

export function InlineCorrection({ correction }: { correction: AICorrection }) {
  return (
    <Popover>
      <PopoverTrigger className="underline decoration-wavy decoration-red-500 underline-offset-4 hover:bg-red-50 rounded px-0.5 transition-colors">
        {correction.original}
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{correction.type}</Badge>
        </div>
        <div>
          <p className="text-sm text-red-500 line-through">{correction.original}</p>
          <p className="text-sm font-medium text-green-600">{correction.corrected}</p>
        </div>
        <p className="text-xs text-muted-foreground">{correction.explanation}</p>
        <p className="text-xs text-muted-foreground">{correction.explanation_ja}</p>
      </PopoverContent>
    </Popover>
  )
}
