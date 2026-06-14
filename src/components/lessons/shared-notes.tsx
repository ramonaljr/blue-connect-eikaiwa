'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { FileText } from 'lucide-react'

interface SharedNotesProps {
  lessonId: string
}

export function SharedNotes({ lessonId }: SharedNotesProps) {
  const [notes, setNotes] = useState('')
  const [remoteEditing, setRemoteEditing] = useState(false)
  const remoteEditingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRemoteUpdate = useRef(false)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Load initial notes
  useEffect(() => {
    supabase
      .from('lesson_notes')
      .select('shared_notes')
      .eq('lesson_id', lessonId)
      .single()
      .then(({ data }) => {
        if (data?.shared_notes) {
          setNotes(data.shared_notes)
        }
      })
  }, [lessonId, supabase])

  // Set up realtime broadcast channel
  useEffect(() => {
    const channel = supabase.channel(`lesson-notes-${lessonId}`)

    channel
      .on('broadcast', { event: 'notes_update' }, ({ payload }) => {
        isRemoteUpdate.current = true
        setNotes(payload.content)

        // Show "other user editing" indicator
        setRemoteEditing(true)
        if (remoteEditingTimer.current) {
          clearTimeout(remoteEditingTimer.current)
        }
        remoteEditingTimer.current = setTimeout(() => {
          setRemoteEditing(false)
        }, 3000)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (remoteEditingTimer.current) clearTimeout(remoteEditingTimer.current)
    }
  }, [lessonId, supabase])

  const saveNotes = useCallback(
    async (content: string) => {
      await supabase
        .from('lesson_notes')
        .upsert(
          { lesson_id: lessonId, shared_notes: content },
          { onConflict: 'lesson_id' }
        )
    },
    [lessonId, supabase]
  )

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value
    setNotes(newContent)

    // Broadcast to other users
    channelRef.current?.send({
      type: 'broadcast',
      event: 'notes_update',
      payload: { content: newContent },
    })

    // Debounced save (2 seconds)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveNotes(newContent)
    }, 2000)
  }

  return (
    <div className="flex h-full flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <FileText className="h-4 w-4" />
          共有ノート
        </div>
        {remoteEditing && (
          <span className="text-xs text-muted-foreground animate-pulse">
            他のユーザーが編集中...
          </span>
        )}
      </div>
      <Textarea
        value={notes}
        onChange={handleChange}
        placeholder="ここにノートを入力..."
        className="min-h-0 flex-1 resize-none"
      />
    </div>
  )
}
