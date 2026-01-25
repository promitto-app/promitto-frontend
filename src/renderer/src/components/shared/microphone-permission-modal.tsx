import { Mic, X } from 'lucide-react'

interface MicrophonePermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onAllow: () => void
  onDeny: () => void
}

export function MicrophonePermissionModal({
  isOpen,
  onClose,
  onAllow,
  onDeny
}: MicrophonePermissionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-muted border border-border rounded-lg max-w-md w-full p-6 shadow-xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Mic className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-white text-lg font-semibold">Permissão de Microfone</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            O Promitto precisa de acesso para monitorar e analisar conversas em reuniões:
          </p>
          <ul className="text-gray-400 text-xs leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Seu microfone (para sua voz)</li>
            <li>Áudio da tela (para capturar o áudio de outras pessoas nas reuniões)</li>
          </ul>
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-blue-300 text-xs font-medium mb-2">⚠️ Importante:</p>
            <p className="text-blue-200 text-xs leading-relaxed">
              Após clicar em &quot;Permitir&quot;, você verá um diálogo para compartilhar a tela. 
              <strong className="text-blue-100"> Selecione a tela desejada e marque a opção &quot;Compartilhar áudio&quot;</strong> para capturar o áudio do sistema.
            </p>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Seus áudios são processados localmente e não são compartilhados. Você pode revogar esta permissão a qualquer momento nas configurações.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDeny}
            className="flex-1 bg-muted border border-border hover:bg-white/5 text-white py-2.5 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Negar
          </button>
          <button
            onClick={onAllow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Permitir
          </button>
        </div>
      </div>
    </div>
  )
}
