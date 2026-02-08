const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://178.128.179.105:3000/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
  }

  async register(email: string, password: string, name?: string) {
    const result = await this.request<{ user: { id: string; email: string; name?: string }; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    this.setToken(result.token)
    return result
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: { id: string; email: string; name?: string }; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    this.setToken(result.token)
    return result
  }

  logout() {
    this.setToken(null)
  }

  async getCurrentUser() {
    return this.request<{ id: string; email: string; name?: string }>('/users/me')
  }

  async updateUser(data: { name?: string; email?: string }) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async getSessions(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return this.request(`/sessions${query}`)
  }

  async searchSessions(query: string) {
    return this.request(`/sessions/search?q=${encodeURIComponent(query)}`)
  }

  async getSessionById(id: string) {
    return this.request(`/sessions/${id}`)
  }

  async createSession(data: {
    title?: string
    transcription?: string
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
  }) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSession(id: string, data: { title?: string }) {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSession(id: string) {
    return this.request(`/sessions/${id}`, {
      method: 'DELETE',
    })
  }

  async updateCompromissos(
    sessionId: string,
    compromissos: Array<{
      responsavel: string
      speakerId: string
      acao: string
      prazoMencionado: string
      prazoInterpretado?: string
      certeza: 'firme' | 'tentativo' | 'incerto'
      contexto: string
    }>
  ) {
    return this.request(`/sessions/${sessionId}/compromissos`, {
      method: 'PUT',
      body: JSON.stringify(compromissos),
    })
  }

  async processAudio(audioBlob: Blob, duration?: number) {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.webm')
    if (duration) {
      formData.append('duration', duration.toString())
    }

    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/audio/process`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
  }

  async getReportContent(sessionId: string, type: string) {
    return this.request<{ content: string; type: string }>(
      `/reports/${sessionId}/content?type=${type}`
    )
  }

  async generateReport(sessionId: string, type: string) {
    return this.request<{ filePath: string; type: string; message: string }>(
      `/reports/${sessionId}/generate`,
      {
        method: 'POST',
        body: JSON.stringify({ type }),
      }
    )
  }
}

export const apiClient = new ApiClient()
