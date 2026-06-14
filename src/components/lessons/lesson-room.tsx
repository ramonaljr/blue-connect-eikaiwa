'use client'

import { useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PhoneOff, Circle } from 'lucide-react'
import { PreJoinScreen } from '@/components/lessons/pre-join-screen'
import { LessonChat } from '@/components/lessons/lesson-chat'
import { SharedNotes } from '@/components/lessons/shared-notes'
import { PhrasePanel } from '@/components/lessons/phrase-panel'
import { LessonTimer } from '@/components/lessons/lesson-timer'

interface LessonRoomProps {
  lessonId: string
  roomUrl?: string | null
  userId: string
  userName: string
  tutorName?: string
  scheduledAt?: string
  durationMinutes?: number
  prepNotes?: string | null
}

export function LessonRoom({
  lessonId,
  roomUrl: initialRoomUrl,
  userId,
  userName,
  tutorName = '講師',
  scheduledAt = new Date().toISOString(),
  durationMinutes = 25,
  prepNotes,
}: LessonRoomProps) {
  const [roomUrl, setRoomUrl] = useState(initialRoomUrl)
  const callFrameRef = useRef<DailyCall | null>(null)
  const [joined, setJoined] = useState(false)
  const [joinedAt, setJoinedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)

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
        showLeaveButton: false,
        showFullscreenButton: true,
      }
    )

    frame.on('left-meeting', () => {
      setJoined(false)
      setJoinedAt(null)
      setRecording(false)
      frame.destroy()
      callFrameRef.current = null
    })

    await frame.join({ url: url! })
    callFrameRef.current = frame
    setJoined(true)
    setJoinedAt(new Date())
    setLoading(false)
  }

  function leaveCall() {
    callFrameRef.current?.leave()
    callFrameRef.current?.destroy()
    callFrameRef.current = null
    setJoined(false)
    setJoinedAt(null)
    setRecording(false)
  }

  function toggleRecording() {
    if (!callFrameRef.current) return
    if (recording) {
      callFrameRef.current.stopRecording()
      setRecording(false)
    } else {
      callFrameRef.current.startRecording()
      setRecording(true)
    }
  }

  useEffect(() => {
    return () => {
      callFrameRef.current?.destroy()
    }
  }, [])

  if (!joined) {
    return (
      <PreJoinScreen
        lessonId={lessonId}
        tutorName={tutorName}
        scheduledAt={scheduledAt}
        duration={durationMinutes}
        prepNotes={prepNotes}
        onJoin={startCall}
      />
    )
  }

  return (
    <div className="flex h-full gap-4">
      {/* Main video area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          {joinedAt && (
            <LessonTimer
              startTime={joinedAt}
              durationMinutes={durationMinutes}
            />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleRecording}>
              <Circle
                className={`mr-1.5 h-3 w-3 ${recording ? 'fill-red-500 text-red-500' : ''}`}
              />
              {recording ? '録画停止' : '録画開始'}
            </Button>
            <Button variant="destructive" size="sm" onClick={leaveCall}>
              <PhoneOff className="mr-1.5 h-3.5 w-3.5" />
              退出する
            </Button>
          </div>
        </div>
        {/* Daily.co container */}
        <div id="daily-container" className="flex-1 bg-black" />
      </div>

      {/* Sidebar */}
      <div className="hidden w-80 flex-col border-l lg:flex">
        <Tabs defaultValue="chat" className="flex flex-1 flex-col">
          <TabsList className="px-2">
            <TabsTrigger value="chat">チャット</TabsTrigger>
            <TabsTrigger value="notes">ノート</TabsTrigger>
            <TabsTrigger value="phrases">フレーズ</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1">
            <LessonChat
              lessonId={lessonId}
              userId={userId}
              userName={userName}
            />
          </TabsContent>
          <TabsContent value="notes" className="flex-1">
            <SharedNotes lessonId={lessonId} />
          </TabsContent>
          <TabsContent value="phrases" className="flex-1">
            <PhrasePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
