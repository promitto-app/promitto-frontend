import { useEffect, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'

interface DownloadProgress {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

export function UpdateNotification() {
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

  useEffect(() => {
    if (!window.api) return

    if (window.api.onDownloadProgress) {
      window.api.onDownloadProgress((progress: DownloadProgress) => {
        setDownloadProgress(progress)
      })
    }

    if (window.api.onUpdateDownloaded) {
      window.api.onUpdateDownloaded(() => {
        setUpdateDownloaded(true)
        setDownloadProgress(null)
      })
    }
  }, [])

  if (!downloadProgress && !updateDownloaded) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 text-white rounded-lg shadow-2xl p-4 max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
      {updateDownloaded ? (
        <div className="flex items-center gap-3">
          <RefreshCw className="text-green-500 animate-spin" size={20} />
          <div>
            <p className="text-sm font-semibold">Atualização pronta</p>
            <p className="text-xs text-gray-400">Reiniciando automaticamente...</p>
          </div>
        </div>
      ) : downloadProgress ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Download className="text-blue-500" size={18} />
            <span className="text-sm font-medium">Atualizando...</span>
            <span className="text-xs text-gray-400 ml-auto">
              {Math.round(downloadProgress.percent)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress.percent}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
