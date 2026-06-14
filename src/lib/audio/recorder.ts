export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private onDataCallback: ((data: Blob) => void) | null = null

  async start(onData: (data: Blob) => void): Promise<void> {
    this.onDataCallback = onData
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus',
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.onDataCallback) {
        this.onDataCallback(event.data)
      }
    }

    // Record in 250ms chunks for near-real-time
    this.mediaRecorder.start(250)
  }

  stop(): void {
    this.mediaRecorder?.stop()
    this.stream?.getTracks().forEach((track) => track.stop())
    this.mediaRecorder = null
    this.stream = null
    this.onDataCallback = null
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}
