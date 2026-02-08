import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Loader2, X } from 'lucide-react'
import { MicrophonePermissionModal } from '../shared/microphone-permission-modal'
import { CompromissosView } from './compromissos-view'
import { SessionsSidebar } from './sessions-sidebar'
import { AudioRecorder } from '../../services/audio-recorder'
import { apiClient } from '../../services/api-client'

interface Compromisso {
  responsavel: string
  speaker_id: string
  acao: string
  prazo_mencionado: string
  prazo_interpretado: string
  certeza: 'firme' | 'tentativo' | 'incerto'
  contexto: string
}

interface Session {
  id: string
  title: string
  createdAt: string
  duration?: number
  compromissos: Compromisso[]
  apiUsed?: string
  transcription?: string
}

const MICROPHONE_PERMISSION_KEY = 'promitto_microphone_permission'

function hasMicrophonePermission(): boolean {
  return localStorage.getItem(MICROPHONE_PERMISSION_KEY) === 'granted'
}

function setMicrophonePermission(granted: boolean) {
  if (granted) {
    localStorage.setItem(MICROPHONE_PERMISSION_KEY, 'granted')
  } else {
    localStorage.removeItem(MICROPHONE_PERMISSION_KEY)
  }
}

export function HomeScreen() {
  const [showMicrophoneModal, setShowMicrophoneModal] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [compromissos, setCompromissos] = useState<Compromisso[] | null>(null)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasScreenAudio, setHasScreenAudio] = useState(false)

  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)
  const transcriptionChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (compromissos === null) {
      
      window.dispatchEvent(new CustomEvent('sessions:reload'))
    }
  }, [compromissos])

  const startRecordingDirectly = useCallback(async () => {
    setError(null)
    setHasScreenAudio(false)

    try {
      console.log('Solicitando permissão do microfone...')
      await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Permissão do microfone concedida')

      const recorder = new AudioRecorder()
      audioRecorderRef.current = recorder
      recordingStartTimeRef.current = Date.now()

      console.log('Iniciando gravação com microfone e tela...')
      
      transcriptionChunksRef.current = []
      
      await recorder.startRecording({ 
        microphone: true, 
        screen: true,
        onScreenAudioCaptured: (hasAudio) => {
          console.log('Status do áudio da tela:', hasAudio)
          setHasScreenAudio(hasAudio)
        },
        onAudioChunk: async (chunk: Blob) => {
          if (chunk.size > 0) {
            transcriptionChunksRef.current.push(chunk)
          }
        },
        chunkIntervalMs: 2000
      })

      setIsMonitoring(true)
      console.log('Monitoramento iniciado - capturando microfone e áudio da tela')
    } catch (error) {
      console.error('Erro ao iniciar monitoramento:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      audioRecorderRef.current = null
      recordingStartTimeRef.current = null
      setMicrophonePermission(false)
      transcriptionChunksRef.current = []
    }
  }, [])

  const handleStartMonitoring = useCallback(async () => {
    if (hasMicrophonePermission()) {
      await startRecordingDirectly()
    } else {
      setShowMicrophoneModal(true)
    }
  }, [startRecordingDirectly])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        
        if (!isMonitoring && !isProcessing && compromissos === null) {
          event.preventDefault()
          handleStartMonitoring()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMonitoring, isProcessing, compromissos, handleStartMonitoring])

  async function handleAllowMicrophone() {
    setShowMicrophoneModal(false)
    setMicrophonePermission(true)
    await startRecordingDirectly()
  }

  function handleDenyMicrophone() {
    setShowMicrophoneModal(false)
    setMicrophonePermission(false)
  }

  async function handleCancelRecording() {
    if (!audioRecorderRef.current) return

    try {
      if (audioRecorderRef.current.isRecording()) {
        await audioRecorderRef.current.stopRecording()
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error)
    } finally {
      setIsMonitoring(false)
      setIsProcessing(false)
      setError(null)
      setHasScreenAudio(false)
      audioRecorderRef.current = null
      recordingStartTimeRef.current = null
      transcriptionChunksRef.current = []
    }
  }

  async function handleStopMonitoring() {
    if (!audioRecorderRef.current) return

    setIsProcessing(true)
    setError(null)

    try {
      const audioBlob = await audioRecorderRef.current.stopRecording()
      setIsMonitoring(false)

      const duration = recordingStartTimeRef.current
        ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        : undefined

      const resultado = await apiClient.processAudio(audioBlob, duration)

      interface ApiCompromisso {
        responsavel: string
        speaker_id?: string
        speakerId?: string
        acao: string
        prazo_mencionado?: string
        prazoMencionado?: string
        prazo_interpretado?: string
        prazoInterpretado?: string
        certeza: 'firme' | 'tentativo' | 'incerto'
        contexto: string
      }

      const mapCompromisso = (c: ApiCompromisso): Compromisso => ({
        responsavel: c.responsavel,
        speaker_id: c.speaker_id || c.speakerId || '',
        acao: c.acao,
        prazo_mencionado: c.prazo_mencionado || c.prazoMencionado || '',
        prazo_interpretado: c.prazo_interpretado || c.prazoInterpretado || '',
        certeza: c.certeza,
        contexto: c.contexto,
      })

      const session: Session = {
        id: resultado.session.id,
        title: resultado.session.title,
        createdAt: resultado.session.createdAt,
        duration: resultado.session.duration || undefined,
        compromissos: resultado.compromissos.map(mapCompromisso),
        transcription: resultado.transcription
      }

      setCurrentSession(session)
      
      setCompromissos(resultado.compromissos.map(mapCompromisso))
    } catch (error) {
      console.error('Erro ao processar áudio:', error)
      setError('Erro ao processar o áudio. Tente novamente.')
    } finally {
      setIsProcessing(false)
      setHasScreenAudio(false)
      
      audioRecorderRef.current = null
      recordingStartTimeRef.current = null
      transcriptionChunksRef.current = []
    }
  }

  function handleCloseCompromissos() {
    setCompromissos(null)
    setCurrentSession(null)
  }

  async function handleUpdateCompromissos(updatedCompromissos: Compromisso[]) {
    if (currentSession) {
      try {
        const compromissosToUpdate = updatedCompromissos.map(c => ({
          responsavel: c.responsavel,
          speakerId: c.speaker_id,
          acao: c.acao,
          prazoMencionado: c.prazo_mencionado,
          prazoInterpretado: c.prazo_interpretado || undefined,
          certeza: c.certeza,
          contexto: c.contexto,
        }))
        await apiClient.updateCompromissos(currentSession.id, compromissosToUpdate)
        
        const updatedSession: Session = {
          ...currentSession,
          compromissos: updatedCompromissos
        }
        setCurrentSession(updatedSession)
        setCompromissos(updatedCompromissos)
        
        window.dispatchEvent(new CustomEvent('sessions:reload'))
      } catch (error) {
        console.error('Erro ao atualizar compromissos:', error)
        alert('Erro ao atualizar compromissos. Tente novamente.')
      }
    }
  }

  async function handleSessionClick(session: Session) {
    try {
      const fullSession = await apiClient.getSessionById(session.id) as {
        id: number | string
        title: string
        createdAt: string
        duration?: number
        transcription?: string
        compromissos?: Array<{
          responsavel: string
          speakerId: string
          acao: string
          prazoMencionado: string | null
          prazoInterpretado?: string | null
          certeza: 'firme' | 'tentativo' | 'incerto'
          contexto: string
        }>
      }

      const mappedSession: Session = {
        id: String(fullSession.id),
        title: fullSession.title,
        createdAt: fullSession.createdAt,
        duration: fullSession.duration || undefined,
        transcription: fullSession.transcription,
        compromissos: (fullSession.compromissos || []).map((c) => ({
          responsavel: c.responsavel,
          speaker_id: c.speakerId,
          acao: c.acao,
          prazo_mencionado: c.prazoMencionado || '',
          prazo_interpretado: c.prazoInterpretado || '',
          certeza: c.certeza,
          contexto: c.contexto,
        })),
      }

      setCurrentSession(mappedSession)
      setCompromissos(mappedSession.compromissos)
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
      setCurrentSession(session)
      setCompromissos(session.compromissos || [])
    }
  }

  if (compromissos !== null || currentSession !== null) {
    return (
      <CompromissosView
        compromissos={compromissos || []}
        onClose={handleCloseCompromissos}
        session={currentSession}
        onUpdate={handleUpdateCompromissos}
      />
    )
  }

  return (
    <>
      <div className="flex h-full">
        <SessionsSidebar onSessionClick={handleSessionClick} />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col px-8 py-6">
            <div className="mb-6">
              <h1 className="text-white text-2xl font-semibold mb-1">Iniciar uma Conversa</h1>
              <p className="text-gray-400 text-xs">
                Use qualquer uma das ações abaixo para começar
              </p>
            </div>

            {!isMonitoring && !isProcessing && (
              <div
                onClick={handleStartMonitoring}
                className="bg-muted/50 border border-border rounded-lg p-5 hover:bg-muted hover:border-white/10 transition-all cursor-pointer group max-w-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Mic className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm mb-0.5">Analisar Conversa</h3>
                    <p className="text-gray-400 text-xs">
                      Solicite análise completa de tudo que foi dito
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background/50 border border-border/50 rounded text-[10px] text-gray-500">
                      Ctrl
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-background/50 border border-border/50 rounded text-[10px] text-gray-500">
                      D
                    </kbd>
                  </div>
                </div>
              </div>
            )}

            {(isMonitoring || isProcessing) && (
              <div className="max-w-xl">
                {isProcessing ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-600/10 border border-gray-600/20">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-300 text-sm">Processando áudio...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/10 border border-red-500/20">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-red-400 text-sm font-medium">Gravando...</span>
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={handleCancelRecording}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border text-white text-xs rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancelar
                        </button>
                        <button
                          onClick={handleStopMonitoring}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                        >
                          Parar e Processar
                        </button>
                      </div>
                    </div>
                    {hasScreenAudio ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/10 border border-green-500/20">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-xs">Áudio do sistema capturado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600/10 border border-yellow-500/20">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 text-xs">Apenas microfone - áudio do sistema não detectado</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs max-w-xl">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <MicrophonePermissionModal
        isOpen={showMicrophoneModal}
        onClose={() => setShowMicrophoneModal(false)}
        onAllow={handleAllowMicrophone}
        onDeny={handleDenyMicrophone}
      />
    </>
  )
}
