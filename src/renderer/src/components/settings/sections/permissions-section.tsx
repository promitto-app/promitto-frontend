import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const MICROPHONE_PERMISSION_KEY = 'promitto_microphone_permission'

interface SettingItemProps {
  title: string
  description: string
  status: 'granted' | 'denied' | 'unknown'
  onRevoke?: () => void
}

function SettingItem({ title, description, status, onRevoke }: SettingItemProps) {
  const statusConfig = {
    granted: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      text: 'Concedida'
    },
    denied: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      text: 'Negada'
    },
    unknown: {
      icon: XCircle,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      text: 'Não solicitada'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
        <div className={`mt-2 inline-flex items-center gap-2 px-2 py-1 rounded ${config.bgColor} ${config.borderColor} border`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
          <span className={`text-xs ${config.color} font-medium`}>{config.text}</span>
        </div>
      </div>
      {status === 'granted' && onRevoke && (
        <button
          onClick={onRevoke}
          className="ml-4 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
        >
          Revogar
        </button>
      )}
    </div>
  )
}

async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'unknown'> {
  const saved = localStorage.getItem(MICROPHONE_PERMISSION_KEY)
  
  if (saved !== 'granted') {
    return 'unknown'
  }

  try {
    const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    if (permission.state === 'granted') {
      return 'granted'
    } else if (permission.state === 'denied') {
      localStorage.removeItem(MICROPHONE_PERMISSION_KEY)
      return 'denied'
    }
  } catch (error) {
    console.error('Erro ao verificar permissão:', error)
  }

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    return 'granted'
  } catch {
    localStorage.removeItem(MICROPHONE_PERMISSION_KEY)
    return 'denied'
  }
}

export function PermissionsSection() {
  const [recordingStatus, setRecordingStatus] = useState<'granted' | 'denied' | 'unknown'>('unknown')

  useEffect(() => {
    async function checkPermissions() {
      const micStatus = await checkMicrophonePermission()
      
      let screenStatus: 'granted' | 'denied' | 'unknown' = 'unknown'
      try {
        const screenPermission = await navigator.permissions.query({ name: 'display-capture' as PermissionName })
        screenStatus = screenPermission.state === 'granted' ? 'granted' : screenPermission.state === 'denied' ? 'denied' : 'unknown'
      } catch {
        screenStatus = 'unknown'
      }

      if (micStatus === 'granted' && screenStatus === 'granted') {
        setRecordingStatus('granted')
      } else if (micStatus === 'denied' || screenStatus === 'denied') {
        setRecordingStatus('denied')
      } else {
        setRecordingStatus('unknown')
      }
    }

    checkPermissions()

    const interval = setInterval(checkPermissions, 2000)
    return () => clearInterval(interval)
  }, [])

  function handleRevokeRecording() {
    if (confirm('Tem certeza que deseja revogar a permissão de gravação? Você precisará permitir novamente na próxima gravação.')) {
      localStorage.removeItem(MICROPHONE_PERMISSION_KEY)
      setRecordingStatus('unknown')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Permissões</h2>

      <div className="space-y-0">
        <SettingItem
          title="Gravação de Áudio"
          description="Necessário para capturar seu microfone e o áudio do sistema durante reuniões e conversas."
          status={recordingStatus}
          onRevoke={handleRevokeRecording}
        />
      </div>
    </div>
  )
}
