import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { lessonId } = await request.json()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  if (lesson.learner_id !== user.id && lesson.tutor_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Return existing room if already created
  if (lesson.daily_room_url) {
    return NextResponse.json({ url: lesson.daily_room_url })
  }

  // Create Daily.co room
  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `lesson-${lessonId}`,
      properties: {
        max_participants: 2,
        enable_recording: 'cloud',
        exp: Math.floor(Date.now() / 1000) + lesson.duration_minutes * 60 + 600, // lesson + 10 min buffer
      },
    }),
  })

  const room = await res.json()

  // Save room URL to lesson
  await supabase
    .from('lessons')
    .update({ daily_room_url: room.url })
    .eq('id', lessonId)

  return NextResponse.json({ url: room.url })
}
