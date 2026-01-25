import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { apiClient } from '../../../services/api-client'
import { User, Mail, Lock, Save, X } from 'lucide-react'

export function AccountSection() {
  const { user, refreshUser } = useAuth()
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setError('O nome não pode estar vazio')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiClient.updateUser({ name: name.trim() })
      await refreshUser()
      setSuccess('Nome atualizado com sucesso!')
      setIsEditingName(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar nome')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Email inválido')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiClient.updateUser({ email: email.trim() })
      await refreshUser()
      setSuccess('Email atualizado com sucesso!')
      setIsEditingEmail(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar email')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos')
      return
    }

    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiClient.changePassword(currentPassword, newPassword)
      setSuccess('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPassword(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Conta</h2>
        <p className="text-gray-400">Carregando informações da conta...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Conta</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Nome</label>
            </div>
            {!isEditingName ? (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateName}
                  disabled={loading}
                  className="p-1.5 text-green-400 hover:text-green-300 disabled:opacity-50"
                  title="Salvar"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false)
                    setName(user.name || '')
                    setError('')
                  }}
                  disabled={loading}
                  className="p-1.5 text-red-400 hover:text-red-300 disabled:opacity-50"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {isEditingName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Seu nome"
              disabled={loading}
            />
          ) : (
            <p className="text-white mt-2">{user.name || 'Não definido'}</p>
          )}
        </div>

        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Email</label>
            </div>
            {!isEditingEmail ? (
              <button
                onClick={() => setIsEditingEmail(true)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateEmail}
                  disabled={loading}
                  className="p-1.5 text-green-400 hover:text-green-300 disabled:opacity-50"
                  title="Salvar"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingEmail(false)
                    setEmail(user.email || '')
                    setError('')
                  }}
                  disabled={loading}
                  className="p-1.5 text-red-400 hover:text-red-300 disabled:opacity-50"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {isEditingEmail ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="seu@email.com"
              disabled={loading}
            />
          ) : (
            <p className="text-white mt-2">{user.email}</p>
          )}
        </div>

        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Senha</label>
            </div>
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Alterar
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsChangingPassword(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setError('')
                }}
                className="p-1.5 text-red-400 hover:text-red-300"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isChangingPassword ? (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Senha atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nova senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </div>
          ) : (
            <p className="text-gray-400 mt-2 text-sm">••••••••</p>
          )}
        </div>

        <div className="bg-muted border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Informações da Conta</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-400">ID:</span>
              <span className="text-white">{user.id}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400">Conta criada em:</span>
              <span className="text-white">
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
