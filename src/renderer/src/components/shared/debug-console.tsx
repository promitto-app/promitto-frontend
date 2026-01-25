import { useEffect, useState } from 'react'
import { X, Minimize2, Maximize2 } from 'lucide-react'

interface DebugLog {
  message: string
  data?: any
  timestamp: string
}

export function DebugConsole() {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    setLogs([{
      message: '🟢 Debug Console Iniciado',
      timestamp: new Date().toISOString()
    }])

    if (window.api?.onDebugLog) {
      window.api.onDebugLog((log: DebugLog) => {
        console.log('📨 Log recebido:', log)
        setLogs(prev => [...prev, log].slice(-50))
      })
    }
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-mono"
      >
        📋 Ver Logs ({logs.length})
      </button>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 p-2 flex items-center gap-2">
        <span className="text-green-400 text-xs font-mono">
          Debug Console ({logs.length} logs)
        </span>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-gray-400 hover:text-white p-1"
        >
          <Maximize2 size={14} />
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white p-1"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 w-[500px] max-h-[400px] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
        <span className="text-green-400 text-xs font-mono font-bold">
          🔍 DEBUG CONSOLE ({logs.length})
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setLogs([])}
            className="text-gray-400 hover:text-white px-2 py-1 text-xs"
          >
            Limpar
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white p-1"
          >
            <Minimize2 size={14} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            Nenhum log ainda...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-2 pb-2 border-b border-gray-800 last:border-0">
              <div className="text-gray-500 text-[10px]">
                {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
              </div>
              <div className="text-green-400 whitespace-pre-wrap break-words">
                {log.message}
              </div>
              {log.data && (
                <details className="mt-1">
                  <summary className="text-blue-400 cursor-pointer text-[10px]">
                    Ver dados
                  </summary>
                  <pre className="text-gray-300 text-[10px] mt-1 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}