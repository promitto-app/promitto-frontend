import { useState, useEffect } from 'react'
import { Clock, Info, Trash2, Download, Edit2, Save, X, Search } from 'lucide-react'
import { apiClient } from '../../services/api-client'
import { AlertDialog } from '../shared/alert-dialog'

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
}

interface SessionsSidebarProps {
  onSessionClick: (session: Session) => void
}

interface ApiSession {
  id: number | string
  title: string
  createdAt: string
  duration?: number
  compromissos?: Array<{
    responsavel: string
    speakerId: string
    acao: string
    prazoMencionado: string
    prazoInterpretado?: string
    certeza: 'firme' | 'tentativo' | 'incerto'
    contexto: string
  }>
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return date.toLocaleDateString('pt-BR')
}

function formatDuration(seconds?: number): string {
  if (!seconds) return ''
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function SessionCard({
  session,
  onDetails,
  onDelete,
  onExport,
  onUpdate
}: {
  session: Session
  onDetails: () => void
  onContinue: () => void
  onDelete: () => void
  onExport: () => void
  onUpdate: (session: Session) => void
}) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(session.title)

  const dataFormatada = new Date(session.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const horaFormatada = new Date(session.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  async function handleSave() {
    if (!editedTitle.trim()) {
      alert('O nome da sessão não pode estar vazio')
      return
    }

    const updatedSession = { ...session, title: editedTitle.trim() }
    await onUpdate(updatedSession)
    setIsEditing(false)
  }

  function handleCancel() {
    setEditedTitle(session.title)
    setIsEditing(false)
  }

  return (
    <div
      className="bg-muted border border-border rounded-lg p-4 mb-3 hover:border-white/20 transition-all cursor-pointer group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave()
                  } else if (e.key === 'Escape') {
                    handleCancel()
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-background border border-blue-500/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSave()
                  }}
                  className="p-1 rounded hover:bg-green-500/10 transition-colors"
                  title="Salvar"
                >
                  <Save className="w-3.5 h-3.5 text-green-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancel()
                  }}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="text-white font-medium text-sm mb-1 truncate">{session.title}</h4>
              <div className="text-xs text-gray-400">
                {dataFormatada} às {horaFormatada}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>{formatTimeAgo(session.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{horaFormatada}</span>
                </div>
                {session.duration && session.duration > 0 && (
                  <span className="text-gray-600">• {formatDuration(session.duration)}</span>
                )}
              </div>
            </>
          )}
        </div>
        {showActions && !isEditing && (
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="p-1.5 rounded hover:bg-white/5 transition-colors"
              title="Renomear"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onExport()
              }}
              className="p-1.5 rounded hover:bg-white/5 transition-colors"
              title="Exportar"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
              title="Deletar"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDetails()
          }}
          className="flex-1 flex items-center justify-center gap-1.5 bg-background border border-border hover:bg-white/5 text-gray-300 text-xs py-1.5 px-2 rounded transition-colors"
        >
          <Info className="w-3 h-3" />
          Detalhes
        </button>
      </div>
    </div>
  )
}

export function SessionsSidebar({ onSessionClick }: SessionsSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    folderPath?: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  async function loadSessions() {
    try {
      const recentSessions = await apiClient.getSessions(10) as ApiSession[]
      setSessions(recentSessions.map((s) => ({
        id: String(s.id),
        title: s.title,
        createdAt: s.createdAt,
        duration: s.duration || undefined,
        compromissos: (s.compromissos || []).map((c) => ({
          responsavel: c.responsavel,
          speaker_id: c.speakerId,
          acao: c.acao,
          prazo_mencionado: c.prazoMencionado,
          prazo_interpretado: c.prazoInterpretado || '',
          certeza: c.certeza,
          contexto: c.contexto,
        })),
      })))
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    }
  }

  async function searchSessions(query: string) {
    try {
      const results = await apiClient.searchSessions(query) as ApiSession[]
      setSessions(results.map((s) => ({
        id: String(s.id),
        title: s.title,
        createdAt: s.createdAt,
        duration: s.duration || undefined,
        compromissos: (s.compromissos || []).map((c) => ({
          responsavel: c.responsavel,
          speaker_id: c.speakerId,
          acao: c.acao,
          prazo_mencionado: c.prazoMencionado,
          prazo_interpretado: c.prazoInterpretado || '',
          certeza: c.certeza,
          contexto: c.contexto,
        })),
      })))
    } catch (error) {
      console.error('Erro ao buscar sessões:', error)
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearchValue(value)
    if (value.trim()) {
      searchSessions(value)
    } else {
      loadSessions()
    }
  }

  useEffect(() => {
    loadSessions()

    const handleReload = () => {
      loadSessions()
      setSearchValue('')
    }

    window.addEventListener('sessions:reload', handleReload)

    return () => {
      window.removeEventListener('sessions:reload', handleReload)
    }
  }, [])

  async function handleDelete(sessionId: string) {
    if (!confirm('Tem certeza que deseja deletar esta sessão?')) return

    try {
      await apiClient.deleteSession(sessionId)
      await loadSessions()
    } catch (error) {
      console.error('Erro ao deletar sessão:', error)
      alert('Erro ao deletar sessão')
    }
  }

  async function handleExport(sessionId: string) {
    try {
      const reportTypes: Array<'transcricao' | 'ata' | 'checks' | 'institucional'> = [
        'transcricao',
        'ata',
        'checks',
        'institucional'
      ]

      const exportedFiles: string[] = []

      for (const type of reportTypes) {
        try {
          const result = await apiClient.generateReport(sessionId, type)
          exportedFiles.push(result.filePath)
        } catch (error) {
          console.error(`Erro ao exportar ${type}:`, error)
        }
      }

      if (exportedFiles.length > 0) {
        const folderPath = exportedFiles[0].substring(0, exportedFiles[0].lastIndexOf('\\'))
        setAlertDialog({
          isOpen: true,
          title: 'Exportação Concluída',
          message: `${exportedFiles.length} relatório(s) exportado(s) com sucesso!\n\nArquivos salvos na pasta:\n${folderPath}`,
          folderPath
        })
      } else {
        setAlertDialog({
          isOpen: true,
          title: 'Erro na Exportação',
          message: 'Nenhum relatório foi exportado. Verifique os erros no console.'
        })
      }
    } catch (error) {
      console.error('Erro ao exportar relatórios:', error)
      setAlertDialog({
        isOpen: true,
        title: 'Erro na Exportação',
        message: `Erro ao exportar relatórios: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    }
  }

  async function handleOpenFolder(folderPath: string) {
    try {
      await window.api.openFolder(folderPath)
    } catch (error) {
      console.error('Erro ao abrir pasta:', error)
    }
  }

  async function handleUpdateSession(updatedSession: Session) {
    try {
      await apiClient.updateSession(updatedSession.id, { title: updatedSession.title })
      await loadSessions()
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error)
      alert('Erro ao atualizar sessão')
    }
  }

  function handleDetails(session: Session) {
    onSessionClick(session)
  }

  function handleContinue(session: Session) {
    onSessionClick(session)
  }

  return (
    <div className="w-[32rem] bg-background border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
          Sessões Recentes
        </h2>
        <div className="relative flex items-center bg-muted border border-border rounded-lg px-3 transition-all focus-within:border-white/15 focus-within:bg-muted/80">
          <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2 w-full placeholder:text-gray-500"
            placeholder="Busque nas suas sessões passadas..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <p>Nenhuma sessão ainda</p>
            <p className="text-xs mt-2">Comece uma nova gravação</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDetails={() => handleDetails(session)}
              onContinue={() => handleContinue(session)}
              onDelete={() => handleDelete(session.id)}
              onExport={() => handleExport(session.id)}
              onUpdate={handleUpdateSession}
            />
          ))
        )}
      </div>


      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        folderPath={alertDialog.folderPath}
        onOpenFolder={alertDialog.folderPath ? () => handleOpenFolder(alertDialog.folderPath!) : undefined}
      />
    </div>
  )
}
