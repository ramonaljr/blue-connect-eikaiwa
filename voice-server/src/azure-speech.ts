export interface PronunciationResult {
  overallScore: number
  phonemes: Array<{
    phoneme: string
    score: number
    offset: number
  }>
  words: Array<{
    word: string
    score: number
  }>
}

export async function scorePronunciation(audioBuffer: Buffer, referenceText: string): Promise<PronunciationResult> {
  const endpoint = `https://${process.env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY!,
      'Content-Type': 'audio/webm',
      'Pronunciation-Assessment': Buffer.from(JSON.stringify({
        ReferenceText: referenceText,
        GradingSystem: 'HundredMark',
        Granularity: 'Phoneme',
      })).toString('base64'),
    },
    body: audioBuffer as unknown as BodyInit,
  })

  if (!res.ok) {
    console.error('Azure Speech error:', res.status)
    return { overallScore: 0, phonemes: [], words: [] }
  }

  const data = await res.json()
  const nBest = data.NBest?.[0]

  if (!nBest) {
    return { overallScore: 0, phonemes: [], words: [] }
  }

  const phonemes = (nBest.Words ?? []).flatMap((word: any) =>
    (word.Phonemes ?? []).map((p: any) => ({
      phoneme: p.Phoneme,
      score: p.PronunciationAssessment?.AccuracyScore ?? 0,
      offset: p.Offset ?? 0,
    }))
  )

  const words = (nBest.Words ?? []).map((w: any) => ({
    word: w.Word,
    score: w.PronunciationAssessment?.AccuracyScore ?? 0,
  }))

  return {
    overallScore: nBest.PronunciationAssessment?.PronScore ?? 0,
    phonemes,
    words,
  }
}
