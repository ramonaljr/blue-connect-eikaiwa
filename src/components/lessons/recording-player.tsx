'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, Video, Download } from 'lucide-react'

interface RecordingPlayerProps {
  recordingUrl: string
  lessonDate: string
  tutorName: string
}

export function RecordingPlayer({ recordingUrl, lessonDate, tutorName }: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-5 w-5 text-blue-600" />
          レッスン録画
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg overflow-hidden bg-black aspect-video">
          <video
            src={recordingUrl}
            controls
            className="w-full h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            お使いのブラウザは動画再生に対応していません
          </video>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{tutorName}とのレッスン — {new Date(lessonDate).toLocaleDateString('ja-JP')}</span>
          <a href={recordingUrl} download>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-3 w-3" /> ダウンロード
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
