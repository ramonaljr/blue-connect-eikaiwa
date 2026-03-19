export class AudioPlayer {
  private audioContext: AudioContext | null = null
  private queue: ArrayBuffer[] = []
  private isPlaying = false
  private onPlayStateChange: ((playing: boolean) => void) | null = null

  constructor(onPlayStateChange?: (playing: boolean) => void) {
    this.onPlayStateChange = onPlayStateChange ?? null
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  async enqueue(audioData: ArrayBuffer): Promise<void> {
    this.queue.push(audioData)
    if (!this.isPlaying) {
      await this.playNext()
    }
  }

  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false
      this.onPlayStateChange?.(false)
      return
    }

    this.isPlaying = true
    this.onPlayStateChange?.(true)

    const ctx = this.getContext()
    const data = this.queue.shift()!

    try {
      const audioBuffer = await ctx.decodeAudioData(data.slice(0))
      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(ctx.destination)
      source.onended = () => this.playNext()
      source.start()
    } catch (err) {
      console.error('Audio playback error:', err)
      await this.playNext()
    }
  }

  stop(): void {
    this.queue = []
    this.isPlaying = false
    this.onPlayStateChange?.(false)
  }

  destroy(): void {
    this.stop()
    this.audioContext?.close()
    this.audioContext = null
  }
}
