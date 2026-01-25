import { useEffect, useState } from 'react'
import { Download, X, Check, RefreshCw } from 'lucide-react'

interface UpdateInfo {
  version: string
  releaseDate?: string
}

interface DownloadProgress {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!window.api) return

    if (window.api.onUpdateAvailable) {
      window.api.onUpdateAvailable((info: UpdateInfo) => {
        console.log('Atualização disponível:', info)
        setUpdateInfo(info)
        setUpdateAvailable(true)
        setShowNotification(true)
        setError(null)
      })
    }

    if (window.api.onDownloadProgress) {
      window.api.onDownloadProgress((progress: DownloadProgress) => {
        console.log('Progresso:', progress)
        setDownloadProgress(progress)
      })
    }

    if (window.api.onUpdateDownloaded) {
      window.api.onUpdateDownloaded((info: UpdateInfo) => {
        console.log('Atualização baixada:', info)
        setUpdateInfo(info)
        setUpdateDownloaded(true)
        setDownloadProgress(null)
        setShowNotification(true)
      })
    }

    if (window.api.onUpdateError) {
      window.api.onUpdateError((err: any) => {
        console.error('Erro na atualização:', err)
        setError(err?.message || 'Erro ao verificar atualizações')
        setShowNotification(true)
        setDownloadProgress(null)
      })
    }
  }, [])

  const handleInstall = () => {
    if (window.api?.installUpdate) {
      window.api.installUpdate()
    }
  }

  const handleClose = () => {
    setShowNotification(false)
    setError(null)
  }

  const handleCheckUpdate = async () => {
    if (window.api?.checkForUpdates) {
      try {
        const result = await window.api.checkForUpdates()
        if (!result.available) {
          setError(result.message || 'Nenhuma atualização disponível')
          setShowNotification(true)
        }
      } catch (err) {
        console.error('Erro ao verificar atualizações:', err)
      }
    }
  }

  if (!showNotification) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 text-white rounded-lg shadow-2xl p-4 max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>

      {error ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <X className="text-red-500" size={20} />
            <h3 className="font-semibold">Informação</h3>
          </div>
          <p className="text-sm text-gray-300 pr-6">{error}</p>
        </div>
      ) : updateDownloaded ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check className="text-green-500" size={20} />
            <h3 className="font-semibold">Atualização pronta!</h3>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Versão {updateInfo?.version} foi baixada e está pronta para ser instalada.
          </p>
          <button
            onClick={handleInstall}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Reiniciar e instalar
          </button>
        </div>
      ) : downloadProgress ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Download className="animate-bounce text-blue-500" size={20} />
            <h3 className="font-semibold">Baixando atualização...</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress.percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{Math.round(downloadProgress.percent)}%</span>
            <span>
              {(downloadProgress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB de{' '}
            {(downloadProgress.total / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      ) : updateAvailable ? ( 
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Download className="text-blue-500" size={20} />
            <h3 className="font-semibold">Nova atualização disponível!</h3>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            Versão <span className="font-mono font-semibold">{updateInfo?.version}</span> está disponível.
          </p>
          <p className="text-xs text-gray-400">
            O download começará automaticamente em breve.
          </p>
        </div>
      ) : null}
    </div>
  )
}