export async function synthesizeSpeech(text: string, slow: boolean = false): Promise<Buffer> {
  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        speed: slow ? 0.7 : 1.0,
      },
    }),
  })

  if (!res.ok) {
    console.error('ElevenLabs error:', res.status, await res.text())
    throw new Error('TTS synthesis failed')
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
