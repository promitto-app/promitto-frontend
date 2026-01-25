import { useState, useEffect } from 'react'
import { Calendar, User, CheckCircle2, AlertCircle, Edit2, Save, X, FileText, Download, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
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
  id?: string
  title?: string
  createdAt?: string
  transcription?: string
}

interface CompromissosViewProps {
  compromissos: Compromisso[]
  onClose: () => void
  session?: Session | null
  onUpdate?: (compromissos: Compromisso[]) => void
}

function formatPrazo(prazoMencionado: string, prazoInterpretado?: string): string {
  if (!prazoInterpretado || prazoInterpretado === 'null' || prazoInterpretado.trim() === '') {
    return prazoMencionado
  }

  try {
    const match = prazoInterpretado.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const [, ano, mes, dia] = match
      return `${prazoMencionado} (${dia}/${mes}/${ano})`
    }
  } catch (e) {
    return prazoMencionado
  }

  return prazoMencionado
}

function formatAcao(acao: string): string {
  if (!acao) return acao

  let formatted = acao.trim().replace(/\s+/g, ' ')

  const nomesProprios = [
    'taiga',
    'jira',
    'trello',
    'notion',
    'slack',
    'teams',
    'github',
    'gitlab',
    'figma',
    'adobe',
    'microsoft',
    'google',
    'amazon',
    'aws'
  ]

  formatted = formatted.toLowerCase()

  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  nomesProprios.forEach((nome) => {
    const regex = new RegExp(`\\b${nome}\\b`, 'gi')
    formatted = formatted.replace(regex, (match) => {

      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
    })
  })

  formatted = formatted
    .replace(/^realizar /i, 'Realizar ')
    .replace(/^fazer /i, 'Fazer ')
    .replace(/^concluir /i, 'Concluir ')
    .replace(/^finalizar /i, 'Finalizar ')
    .replace(/^enviar /i, 'Enviar ')
    .replace(/^preparar /i, 'Preparar ')
    .replace(/^revisar /i, 'Revisar ')
    .replace(/^atualizar /i, 'Atualizar ')

  if (formatted.length < 60 && formatted.endsWith('.')) {
    formatted = formatted.slice(0, -1).trim()
  }

  return formatted
}

function CompromissoCard({
  compromisso,
  index,
  onUpdate
}: {
  compromisso: Compromisso
  index: number
  onUpdate?: (index: number, updated: Compromisso) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [edited, setEdited] = useState<Compromisso>(compromisso)

  const certezaColors = {
    firme: 'text-green-400 bg-green-400/10 border-green-400/20',
    tentativo: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    incerto: 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }

  const certezaIcons = {
    firme: CheckCircle2,
    tentativo: AlertCircle,
    incerto: AlertCircle
  }

  const Icon = certezaIcons[compromisso.certeza]

  function handleSave() {
    if (onUpdate) {
      onUpdate(index, edited)
    }
    setIsEditing(false)
  }

  function handleCancel() {
    setEdited(compromisso)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-muted border-2 border-blue-500/50 rounded-lg p-5">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Responsável</label>
            <input
              type="text"
              value={edited.responsavel}
              onChange={(e) => setEdited({ ...edited, responsavel: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Speaker ID</label>
            <input
              type="text"
              value={edited.speaker_id}
              onChange={(e) => setEdited({ ...edited, speaker_id: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Ação</label>
            <textarea
              value={edited.acao}
              onChange={(e) => setEdited({ ...edited, acao: e.target.value })}
              rows={2}
              className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Prazo mencionado</label>
            <input
              type="text"
              value={edited.prazo_mencionado}
              onChange={(e) => setEdited({ ...edited, prazo_mencionado: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Prazo interpretado (YYYY-MM-DD)</label>
            <input
              type="text"
              value={edited.prazo_interpretado}
              onChange={(e) => setEdited({ ...edited, prazo_interpretado: e.target.value })}
              placeholder="2026-01-08"
              className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Certeza</label>
            <select
              value={edited.certeza}
              onChange={(e) =>
                setEdited({ ...edited, certeza: e.target.value as 'firme' | 'tentativo' | 'incerto' })
              }
              className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="firme">Firme</option>
              <option value="tentativo">Tentativo</option>
              <option value="incerto">Incerto</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Contexto</label>
            <textarea
              value={edited.contexto}
              onChange={(e) => setEdited({ ...edited, contexto: e.target.value })}
              rows={2}
              className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-muted border border-border hover:bg-white/5 text-white rounded-lg transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="bg-muted border border-border rounded-lg p-5 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{compromisso.responsavel}</h3>
            <span className="text-gray-400 text-xs">Speaker {compromisso.speaker_id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`px-2 py-1 rounded border text-xs font-medium flex items-center gap-1 ${certezaColors[compromisso.certeza]}`}
          >
            <Icon className="w-3 h-3" />
            {compromisso.certeza}
          </div>
          {onUpdate && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              title="Editar compromisso"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-white mb-3 font-medium">{formatAcao(compromisso.acao)}</p>

      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatPrazo(compromisso.prazo_mencionado, compromisso.prazo_interpretado)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-gray-400 text-xs italic">&quot;{compromisso.contexto}&quot;</p>
      </div>
    </div>
  )
}

interface ReportState {
  content: string | null
  isLoading: boolean
  isExpanded: boolean
}

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

export function CompromissosView({ compromissos, onClose, onUpdate, session }: CompromissosViewProps) {

  const compromissosMapeados: Compromisso[] = compromissos.map(mapCompromisso)

  const [localCompromissos, setLocalCompromissos] = useState<Compromisso[]>(compromissosMapeados)
  const [reports, setReports] = useState<Record<string, ReportState>>({
    transcricao: { content: null, isLoading: false, isExpanded: false },
    ata: { content: null, isLoading: false, isExpanded: false },
    checks: { content: null, isLoading: false, isExpanded: false },
    institucional: { content: null, isLoading: false, isExpanded: false }
  })
  const [exportingReport, setExportingReport] = useState<string | null>(null)
  const [exportingAll, setExportingAll] = useState(false)
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })


  useEffect(() => {
    const compromissosMapeados: Compromisso[] = compromissos.map(mapCompromisso)
    setLocalCompromissos(compromissosMapeados)
  }, [compromissos])

  function handleUpdate(index: number, updated: Compromisso) {
    const newCompromissos = [...localCompromissos]
    newCompromissos[index] = updated
    setLocalCompromissos(newCompromissos)
    if (onUpdate) {
      onUpdate(newCompromissos)
    }
  }

  async function handleToggleReport(type: 'transcricao' | 'ata' | 'checks' | 'institucional') {
    if (!session?.id) {
      setAlertDialog({
        isOpen: true,
        title: 'Erro',
        message: 'Sessão não encontrada'
      })
      return
    }

    const currentReport = reports[type]
    const isExpanding = !currentReport.isExpanded

    if (isExpanding && !currentReport.content) {
      setReports(prev => ({
        ...prev,
        [type]: { ...prev[type], isLoading: true, isExpanded: true }
      }))

      try {
        const result = await apiClient.getReportContent(session.id, type)
        const content = result.content

        setReports(prev => ({
          ...prev,
          [type]: { content, isLoading: false, isExpanded: true }
        }))
      } catch (error) {
        console.error('Erro ao carregar relatório:', error)
        setAlertDialog({
          isOpen: true,
          title: 'Erro',
          message: `Erro ao carregar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        })
        setReports(prev => ({
          ...prev,
          [type]: { ...prev[type], isLoading: false, isExpanded: false }
        }))
      }
    } else {

      setReports(prev => ({
        ...prev,
        [type]: { ...prev[type], isExpanded: isExpanding }
      }))
    }
  }

  async function handleExportReport(type: 'transcricao' | 'ata' | 'checks' | 'institucional') {
    if (!session?.id) return
  
    setExportingReport(type)
  
    try {
      const result = await apiClient.generateReport(session.id, type)
      const fileName = `promitto-${type}-${session.id}.txt`
  
      const saveResult = await window.api.downloadFiles([{ url: result.fileUrl, name: fileName }])
  
      if (saveResult.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Exportação Concluída',
          message: `Arquivo salvo em: ${saveResult.folderPath}`
        })
      } else {
        setAlertDialog({
          isOpen: true,
          title: 'Erro na Exportação',
          message: saveResult.message
        })
      }
  
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      setAlertDialog({
        isOpen: true,
        title: 'Erro na Exportação',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setExportingReport(null)
    }
  }


  async function handleExportAllReports() {
    if (!session?.id) return

    const reportTypes: Array<'transcricao' | 'ata' | 'checks' | 'institucional'> = [
      'transcricao', 'ata', 'checks', 'institucional'
    ]

    const filesToDownload: { url: string; name: string }[] = []

    for (const type of reportTypes) {
      try {
        const result = await apiClient.generateReport(session.id, type)
        const fileName = `promitto-${type}-${session.id}.txt`
        filesToDownload.push({ url: result.fileUrl, name: fileName })
      } catch (error) {
        console.error(`Erro ao exportar ${type}:`, error)
      }
    }

    if (filesToDownload.length === 0) return

    const result = await window.api.downloadFiles(filesToDownload)

    if (result.success) {
      alert(`Todos os arquivos foram salvos em: ${result.folderPath}`)
    } else {
      alert(`Falha ao baixar arquivos: ${result.message}`)
    }
  }

  const reportTypes = [
    { id: 'transcricao' as const, label: 'Transcrição Completa', icon: FileText },
    { id: 'ata' as const, label: 'Ata de Reunião', icon: FileText },
    { id: 'checks' as const, label: 'Checklist', icon: CheckCircle2 },
    { id: 'institucional' as const, label: 'Relatório Institucional', icon: FileText }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Compromissos Identificados</h2>
          <p className="text-gray-400 text-sm">
            {compromissos.length} compromisso{compromissos.length !== 1 ? 's' : ''} encontrado
            {compromissos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-muted border border-border hover:bg-white/5 text-white rounded-lg transition-colors"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {localCompromissos.map((compromisso, index) => (
          <CompromissoCard
            key={index}
            compromisso={compromisso}
            index={index}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Relatórios</h3>
          <button
            onClick={handleExportAllReports}
            disabled={exportingAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          >
            {exportingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exportando todos...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exportar Todos (.txt)</span>
              </>
            )}
          </button>
        </div>
        <div className="space-y-3">
          {reportTypes.map(({ id, label, icon: Icon }) => {
            const report = reports[id]
            return (
              <div
                key={id}
                className="bg-muted border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => handleToggleReport(id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{label}</span>
                    {report.isLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  {report.isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {report.isExpanded && report.content && (
                  <div className="border-t border-border">
                    <div className="p-4 bg-background/50">
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={() => handleExportReport(id)}
                          disabled={exportingReport === id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                        >
                          {exportingReport === id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Exportando...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Exportar como .txt</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono bg-background/50 p-4 rounded border border-border overflow-x-auto max-h-96 overflow-y-auto">
                        {report.content}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
      />
    </div>
  )
}
