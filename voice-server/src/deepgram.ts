export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'audio/webm',
    },
    body: audioBuffer as unknown as BodyInit,
  })

  if (!res.ok) {
    console.error('Deepgram error:', res.status, await res.text())
    return ''
  }

  const data = await res.json()
  return data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''
}
