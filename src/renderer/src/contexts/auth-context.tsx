import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { apiClient } from '../services/api-client'

interface User {
  id: string
  email: string
  name?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshUserRef = useRef(false)

  const refreshUser = async () => {
    if (refreshUserRef.current) return
    refreshUserRef.current = true
    
    try {
      const userData = await apiClient.getCurrentUser()
      setUser(userData as User)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      setUser(null)
      apiClient.logout()
    } finally {
      refreshUserRef.current = false
    }
  }

  useEffect(() => {
    const token = apiClient.getToken()
    if (token) {
      refreshUser().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const result = await apiClient.login(email, password)
    setUser(result.user as User)
  }

  const register = async (email: string, password: string, name?: string) => {
    const result = await apiClient.register(email, password, name)
    setUser(result.user as User)
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
