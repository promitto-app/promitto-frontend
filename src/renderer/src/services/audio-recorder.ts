
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private microphoneStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private combinedStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private destination: MediaStreamAudioDestinationNode | null = null
  
  private onScreenAudioCaptured?: (hasAudio: boolean) => void
  private onAudioChunk?: (chunk: Blob) => void
  private chunkInterval?: NodeJS.Timeout

  async startRecording(
    options?: { 
      microphone?: boolean
      screen?: boolean
      onScreenAudioCaptured?: (hasAudio: boolean) => void
      onAudioChunk?: (chunk: Blob) => void
      chunkIntervalMs?: number
    }
  ): Promise<void> {
    try {
      const { microphone = true, screen = true, onScreenAudioCaptured, onAudioChunk, chunkIntervalMs = 5000 } = options || {}
      this.onScreenAudioCaptured = onScreenAudioCaptured
      this.onAudioChunk = onAudioChunk
      const intervalMs = chunkIntervalMs

      if (microphone) {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
      }

      if (screen) {
        try {
          
          if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new Error(
              'A API de compartilhamento de tela não está disponível neste navegador. Por favor, use uma versão atualizada do Electron ou Chrome.'
            )
          }

          console.log('Solicitando compartilhamento de tela com áudio...')
          
          const displayMedia = await navigator.mediaDevices.getDisplayMedia({
            video: {
              displaySurface: 'monitor', 
              cursor: 'never' 
            } as MediaTrackConstraints,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
              sampleRate: 48000,
              
              suppressLocalAudioPlayback: false
            } as MediaTrackConstraints
          })

          console.log('Diálogo de compartilhamento respondido')
          console.log('Tracks de vídeo:', displayMedia.getVideoTracks().length)
          console.log('Tracks de áudio:', displayMedia.getAudioTracks().length)

          const audioTracks = displayMedia.getAudioTracks()
          if (audioTracks.length === 0) {
            console.warn('Nenhuma track de áudio encontrada - usuário não compartilhou áudio')
            
            displayMedia.getVideoTracks().forEach(track => track.stop())
            
            if (this.onScreenAudioCaptured) {
              this.onScreenAudioCaptured(false)
            }
            
            throw new Error(
              'Áudio do sistema não foi compartilhado. Por favor, selecione a tela e marque a opção "Compartilhar áudio" no diálogo.'
            )
          }

          displayMedia.getVideoTracks().forEach(track => {
            track.stop()
            
            track.onended = () => {
              console.log('Compartilhamento de tela encerrado - continuando apenas com microfone')
              
              if (this.screenStream) {
                this.screenStream.getTracks().forEach(audioTrack => audioTrack.stop())
                this.screenStream = null
              }
            }
          })

          this.screenStream = new MediaStream(audioTracks)
          console.log(`Áudio da tela capturado com sucesso (${audioTracks.length} track(s))`)
          
          if (this.onScreenAudioCaptured) {
            this.onScreenAudioCaptured(true)
          }
          
          audioTracks.forEach(track => {
            track.onended = () => {
              console.log('Áudio da tela foi interrompido')
              if (this.onScreenAudioCaptured) {
                this.onScreenAudioCaptured(false)
              }
              if (this.screenStream) {
                this.screenStream.getTracks().forEach(audioTrack => {
                  if (audioTrack !== track) {
                    audioTrack.stop()
                  }
                })
                this.screenStream = null
              }
            }
          })
        } catch (error) {
          console.error('Erro ao capturar áudio da tela:', error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          
          if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop())
            this.screenStream = null
          }
          
          if (this.onScreenAudioCaptured) {
            this.onScreenAudioCaptured(false)
          }
          
          if (errorMessage.includes('Compartilhar áudio') || errorMessage.includes('não foi compartilhado')) {
            throw error 
          }
          
          if (errorMessage.includes('NotAllowedError') || errorMessage.includes('cancel')) {
            throw new Error(
              'Compartilhamento de tela cancelado. Por favor, selecione a tela e marque "Compartilhar áudio" para continuar.'
            )
          }
          
          throw new Error(
            `Erro ao capturar áudio do sistema: ${errorMessage}. Por favor, tente novamente e certifique-se de marcar "Compartilhar áudio".`
          )
        }
      }

      this.combinedStream = await this.combineAudioStreams()

      if (!this.combinedStream || this.combinedStream.getAudioTracks().length === 0) {
        throw new Error('Nenhuma fonte de áudio disponível')
      }

      this.audioChunks = []

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ]

      let selectedMimeType = 'audio/webm'
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      this.mediaRecorder = new MediaRecorder(this.combinedStream, {
        mimeType: selectedMimeType
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
          if (this.onAudioChunk) {
            this.onAudioChunk(event.data)
          }
        }
      }

      const timeslice = intervalMs || 1000
      this.mediaRecorder.start(timeslice)
      
      if (this.onAudioChunk && intervalMs > 0) {
        this.chunkInterval = setInterval(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.requestData()
          }
        }, intervalMs)
      }
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      this.cleanup()
      throw error
    }
  }

  private async combineAudioStreams(): Promise<MediaStream> {
    try {
      this.audioContext = new AudioContext({ sampleRate: 48000 })
      this.destination = this.audioContext.createMediaStreamDestination()

      if (this.microphoneStream) {
        const micSource = this.audioContext.createMediaStreamSource(this.microphoneStream)
        micSource.connect(this.destination)
      }

      if (this.screenStream) {
        const screenSource = this.audioContext.createMediaStreamSource(this.screenStream)
        screenSource.connect(this.destination)
      }

      return this.destination.stream
    } catch (error) {
      console.error('Erro ao combinar streams de áudio:', error)
      throw error
    }
  }

  getCurrentRecording(): Blob | null {
    if (this.audioChunks.length === 0) {
      return null
    }
    return new Blob(this.audioChunks, { type: 'audio/webm' })
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Gravação não iniciada'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.onerror = (error) => {
        this.cleanup()
        reject(error)
      }

      this.mediaRecorder.stop()
    })
  }

  private cleanup(): void {
    if (this.chunkInterval) {
      clearInterval(this.chunkInterval)
      this.chunkInterval = undefined
    }

    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop())
      this.microphoneStream = null
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop())
      this.screenStream = null
    }

    if (this.combinedStream) {
      this.combinedStream.getTracks().forEach((track) => track.stop())
      this.combinedStream = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.destination = null
    this.mediaRecorder = null
    this.audioChunks = []
    this.onAudioChunk = undefined
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  async convertToWav(blob: Blob): Promise<Blob> {
    
    return blob
  }
}
