'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Globe, Sparkles } from 'lucide-react'

interface TutorAboutProps {
  tutor: {
    bio: string
    bio_ja: string
    languages_spoken: string[]
    specialties: string[]
    certification_status: string
  }
  locale: string
}

const languageLabels: Record<string, string> = {
  english: '英語',
  japanese: '日本語',
  chinese: '中国語',
  korean: '韓国語',
  spanish: 'スペイン語',
  french: 'フランス語',
  german: 'ドイツ語',
  portuguese: 'ポルトガル語',
}

const specialtyLabels: Record<string, string> = {
  conversation: '日常会話',
  business: 'ビジネス英語',
  toeic: 'TOEIC対策',
  toefl: 'TOEFL対策',
  ielts: 'IELTS対策',
  eiken: '英検対策',
  pronunciation: '発音矯正',
  grammar: '文法',
  kids: 'キッズ英語',
  travel: '旅行英語',
  academic: 'アカデミック',
  interview: '面接対策',
}

export function TutorAbout({ tutor, locale }: TutorAboutProps) {
  const bio = locale === 'ja' ? tutor.bio_ja || tutor.bio : tutor.bio

  return (
    <div className="space-y-6">
      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">自己紹介</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>
          {/* Show alternate language bio if available */}
          {locale === 'ja' && tutor.bio && tutor.bio !== tutor.bio_ja && (
            <>
              <Separator className="my-4" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {tutor.bio}
              </p>
            </>
          )}
          {locale !== 'ja' && tutor.bio_ja && tutor.bio_ja !== tutor.bio && (
            <>
              <Separator className="my-4" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {tutor.bio_ja}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            話せる言語
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tutor.languages_spoken.map((lang) => (
              <Badge key={lang} variant="secondary">
                {languageLabels[lang.toLowerCase()] ?? lang}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            専門分野
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tutor.specialties.map((spec) => (
              <Badge key={spec} variant="outline">
                {specialtyLabels[spec.toLowerCase()] ?? spec}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
