'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '@/lib/actions/settings'
import type { User, CEFRLevel } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CEFR_LEVELS: { value: CEFRLevel; label: string }[] = [
  { value: 'A1', label: 'A1 - 入門' },
  { value: 'A2', label: 'A2 - 初級' },
  { value: 'B1', label: 'B1 - 中級' },
  { value: 'B2', label: 'B2 - 中上級' },
  { value: 'C1', label: 'C1 - 上級' },
  { value: 'C2', label: 'C2 - 最上級' },
]

const TIMEZONES: { value: string; label: string }[] = [
  { value: 'Asia/Tokyo', label: '日本標準時 (JST)' },
  { value: 'America/New_York', label: '東部標準時 (EST)' },
  { value: 'America/Los_Angeles', label: '太平洋標準時 (PST)' },
  { value: 'America/Chicago', label: '中部標準時 (CST)' },
  { value: 'Europe/London', label: 'グリニッジ標準時 (GMT)' },
  { value: 'Europe/Paris', label: '中央ヨーロッパ時間 (CET)' },
  { value: 'Asia/Shanghai', label: '中国標準時 (CST)' },
  { value: 'Asia/Seoul', label: '韓国標準時 (KST)' },
  { value: 'Australia/Sydney', label: 'オーストラリア東部時間 (AEST)' },
]

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.display_name)
  const [fullName, setFullName] = useState(user.full_name)
  const [englishLevel, setEnglishLevel] = useState<CEFRLevel>(user.english_level)
  const [timezone, setTimezone] = useState(user.timezone)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateProfile({
        display_name: displayName,
        full_name: fullName,
        english_level: englishLevel,
        timezone,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('プロフィールを更新しました')
      }
    } catch {
      toast.error('プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール情報</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">表示名</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">氏名</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="氏名を入力"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="english_level">英語レベル</Label>
            <Select
              value={englishLevel}
              onValueChange={(value) => setEnglishLevel(value as CEFRLevel)}
            >
              <SelectTrigger id="english_level">
                <SelectValue placeholder="レベルを選択" />
              </SelectTrigger>
              <SelectContent>
                {CEFR_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">タイムゾーン</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="タイムゾーンを選択" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
