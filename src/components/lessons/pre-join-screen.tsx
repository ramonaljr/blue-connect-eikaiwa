'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Mic, Clock, BookOpen, User } from 'lucide-react'

interface PreJoinScreenProps {
  lessonId: string
  tutorName: string
  scheduledAt: string
  duration: number
  prepNotes?: string | null
  onJoin: () => void
}

export function PreJoinScreen({
  lessonId,
  tutorName,
  scheduledAt,
  duration,
  prepNotes,
  onJoin,
}: PreJoinScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)

  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[]
    mics: MediaDeviceInfo[]
  }>({ cameras: [], mics: [] })
  const [selectedCamera, setSelectedCamera] = useState('')
  const [selectedMic, setSelectedMic] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [mediaError, setMediaError] = useState<string | null>(null)

  const startPreview = useCallback(
    async (cameraId?: string, micId?: string) => {
      try {
        // Stop existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
        }
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current)
        }

        const constraints: MediaStreamConstraints = {
          video: cameraId ? { deviceId: { exact: cameraId } } : true,
          audio: micId ? { deviceId: { exact: micId } } : true,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Mic level analyser
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray)
          const avg =
            dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length
          setMicLevel(Math.min(avg / 128, 1))
          animFrameRef.current = requestAnimationFrame(updateLevel)
        }
        updateLevel()

        setMediaError(null)
      } catch (err) {
        setMediaError(
          'カメラ・マイクにアクセスできません。ブラウザの設定を確認してください。'
        )
      }
    },
    []
  )

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((list) => {
      setDevices({
        cameras: list.filter((d) => d.kind === 'videoinput'),
        mics: list.filter((d) => d.kind === 'audioinput'),
      })
    })

    startPreview()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [startPreview])

  function handleCameraChange(deviceId: string) {
    setSelectedCamera(deviceId)
    startPreview(deviceId, selectedMic || undefined)
  }

  function handleMicChange(deviceId: string) {
    setSelectedMic(deviceId)
    startPreview(selectedCamera || undefined, deviceId)
  }

  const formattedTime = new Date(scheduledAt).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-8">
      {/* Lesson info card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>レッスン情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">講師:</span> {tutorName}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">時間:</span> {formattedTime} /{' '}
            {duration}分
          </div>
          {prepNotes && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                <BookOpen className="h-4 w-4" />
                準備メモ
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {prepNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera / mic preview */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>カメラ・マイクの確認</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mediaError ? (
            <div className="rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
              {mediaError}
            </div>
          ) : (
            <>
              {/* Video preview */}
              <div className="mx-auto aspect-video max-w-md overflow-hidden rounded-xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Mic level indicator */}
              <div className="flex items-center gap-3">
                <Mic className="h-4 w-4 text-muted-foreground" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-75"
                    style={{ width: `${micLevel * 100}%` }}
                  />
                </div>
              </div>

              {/* Device selectors */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                    <Video className="h-3.5 w-3.5" />
                    カメラ
                  </label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {devices.cameras.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `カメラ ${d.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                    <Mic className="h-3.5 w-3.5" />
                    マイク
                  </label>
                  <select
                    value={selectedMic}
                    onChange={(e) => handleMicChange(e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {devices.mics.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `マイク ${d.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Join button */}
      <Button size="lg" className="w-full max-w-md text-lg" onClick={onJoin}>
        レッスンに参加
      </Button>
    </div>
  )
}
