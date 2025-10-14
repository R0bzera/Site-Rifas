// Configuração da API usando variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7092/api'
const AUTH_KEY = import.meta.env.VITE_AUTH_KEY || 'sr_auth_v1'
const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true'

function getToken() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    return session?.token || null
  } catch {
    return null
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const token = getToken()
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`
  }

  const isFormData = options.body instanceof FormData
  if (isFormData) {
    delete defaultOptions.headers['Content-Type']
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (response.status === 401) {
      localStorage.removeItem(AUTH_KEY)
      
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || 'Sessão expirada. Faça login novamente.')
      error.isAuthError = true
      error.statusCode = 401
      throw error
    }
    
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || 'Acesso negado.')
      error.isForbiddenError = true
      error.statusCode = 403
      throw error
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = DEBUG_MODE 
        ? `HTTP error! status: ${response.status}` 
        : 'Erro interno do servidor'
      throw new Error(errorData.message || errorMessage)
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    // Log apenas em modo debug
    if (DEBUG_MODE) {
      console.error('API Request Error:', error)
    }
    throw error
  }
}

export { API_BASE_URL, apiRequest }
