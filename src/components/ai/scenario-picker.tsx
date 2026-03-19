'use client'

import { useState } from 'react'
import {
  MessageSquare,
  UtensilsCrossed,
  Briefcase,
  Plane,
  Building2,
  Coffee,
  Stethoscope,
  ShoppingBag,
  Hotel,
  Phone,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ROLEPLAY_SCENARIOS, type ScenarioKey } from '@/lib/ai/system-prompts'

const SCENARIO_ICONS: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed,
  job_interview: Briefcase,
  airport: Plane,
  business_meeting: Building2,
  small_talk: Coffee,
  doctor: Stethoscope,
  shopping: ShoppingBag,
  hotel: Hotel,
  phone_call: Phone,
  custom: Pencil,
}

interface ScenarioPickerProps {
  onSelect: (scenarioKey: ScenarioKey | null, customTopic?: string) => void
}

export function ScenarioPicker({ onSelect }: ScenarioPickerProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customTopic, setCustomTopic] = useState('')

  function handleSelect(key: ScenarioKey | null) {
    if (key === 'custom') {
      setShowCustomInput(true)
      return
    }
    onSelect(key)
  }

  function handleCustomSubmit() {
    if (!customTopic.trim()) return
    onSelect('custom', customTopic.trim())
  }

  function handleCustomKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomSubmit()
    }
  }

  const scenarioKeys = Object.keys(ROLEPLAY_SCENARIOS) as ScenarioKey[]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">シナリオを選択</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          英会話の練習をしたいシーンを選びましょう
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {/* Free Conversation — special first card */}
        <button
          onClick={() => handleSelect(null)}
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-primary bg-primary/10 p-6 text-center transition-all hover:shadow-md dark:bg-primary/15 dark:hover:bg-primary/20"
        >
          <MessageSquare className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium">自由会話</span>
        </button>

        {/* Scenario cards */}
        {scenarioKeys.map((key) => {
          const scenario = ROLEPLAY_SCENARIOS[key]
          const Icon = SCENARIO_ICONS[key]
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-transparent bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md dark:border-border dark:hover:border-primary dark:hover:bg-card/80"
            >
              <Icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{scenario.name_ja}</span>
            </button>
          )
        })}
      </div>

      {/* Custom topic input */}
      {showCustomInput && (
        <div className="flex items-center gap-2">
          <Input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="練習したいトピックを入力..."
            autoFocus
            className="flex-1"
          />
          <Button onClick={handleCustomSubmit} disabled={!customTopic.trim()}>
            開始
          </Button>
        </div>
      )}
    </div>
  )
}
