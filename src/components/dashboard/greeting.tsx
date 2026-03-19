'use client'

import { useState, useEffect } from 'react'

export function Greeting({ displayName }: { displayName: string }) {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは')
  }, [])

  return (
    <h1 className="text-3xl font-bold">
      {greeting ? `${greeting}、${displayName}さん` : `${displayName}さん`}
    </h1>
  )
}
