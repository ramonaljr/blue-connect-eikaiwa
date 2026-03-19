'use client'

import { useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { Button } from '@/components/ui/button'
import { Phone, PhoneOff } from 'lucide-react'

interface LessonRoomProps {
  lessonId: string
  roomUrl?: string | null
}

export function LessonRoom({ lessonId, roomUrl: initialRoomUrl }: LessonRoomProps) {
  const [roomUrl, setRoomUrl] = useState(initialRoomUrl)
  const callFrameRef = useRef<DailyCall | null>(null)
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  async function startCall() {
    setLoading(true)

    let url = roomUrl
    if (!url) {
      const res = await fetch('/api/lessons/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      })
      const data = await res.json()
      url = data.url
      setRoomUrl(url)
    }

    const frame = DailyIframe.createFrame(
      document.getElementById('daily-container')!,
      {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '0.5rem',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      }
    )

    frame.on('left-meeting', () => {
      setJoined(false)
      frame.destroy()
      callFrameRef.current = null
    })

    await frame.join({ url: url! })
    callFrameRef.current = frame
    setJoined(true)
    setLoading(false)
  }

  function leaveCall() {
    callFrameRef.current?.leave()
    callFrameRef.current?.destroy()
    callFrameRef.current = null
    setJoined(false)
  }

  useEffect(() => {
    return () => {
      callFrameRef.current?.destroy()
    }
  }, [])

  return (
    <div className="space-y-4">
      {!joined && (
        <div className="flex justify-center py-12">
          <Button onClick={startCall} disabled={loading} size="lg">
            <Phone className="mr-2 h-5 w-5" />
            {loading ? '接続中...' : 'レッスンを開始する'}
          </Button>
        </div>
      )}

      <div
        id="daily-container"
        className={`aspect-video w-full rounded-lg bg-black ${!joined ? 'hidden' : ''}`}
      />

      {joined && (
        <div className="flex justify-center">
          <Button variant="destructive" onClick={leaveCall}>
            <PhoneOff className="mr-2 h-4 w-4" />
            退出する
          </Button>
        </div>
      )}
    </div>
  )
}
