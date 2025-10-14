import { apiRequest } from './apiConfig.js'

const AUTH_KEY = 'sr_auth_v1'
const CACHE_DURATION = 30000

function isValidName(name) {
  return typeof name === 'string' && name.trim().length >= 2
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return typeof email === 'string' && emailRegex.test(email)
}

function isValidPhone(phoneDigits) {
  return typeof phoneDigits === 'string' && (phoneDigits.length === 10 || phoneDigits.length === 11)
}

export const authService = {
  async register({ name, email, phone, password }) {
    if (!isValidName(name)) return { ok: false, message: 'Nome deve ter pelo menos 2 caracteres' }
    if (!isValidEmail(email)) return { ok: false, message: 'Email inválido' }
    if (!isValidPhone(phone)) return { ok: false, message: 'Celular inválido' }
    if (typeof password !== 'string' || password.length < 6) return { ok: false, message: 'Senha deve ter pelo menos 6 caracteres' }

    try {
      const response = await apiRequest('/Usuario/createuser', {
        method: 'POST',
        body: JSON.stringify({
          nome: name,
          email,
          telefone: phone,
          senha: password
        })
      })
      
      return { ok: true, data: response }
    } catch (error) {
      return { ok: false, message: error.message || 'Erro ao criar usuário' }
    }
  },

  async login({ email, password }) {
    if (!isValidEmail(email)) {
      return { ok: false, message: 'Email inválido' }
    }
    if (typeof password !== 'string' || password.length < 6) {
      return { ok: false, message: 'Senha inválida' }
    }

    try {
      const response = await apiRequest('/Usuario/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          senha: password
        })
      })

      if (!response.token) {
        throw new Error('Token não retornado pelo servidor. Contate o suporte.')
      }

      const session = { 
        email, 
        userId: response.usuarioId,
        nome: response.nome,
        role: response.role,
        token: response.token,
        expiresAt: response.expiresAt,
        at: Date.now() 
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(session))
      
      return { ok: true, data: response }
    } catch (error) {
      return { ok: false, message: error.message || 'Erro ao fazer login' }
    }
  },

  async logout() {
    try {
      await apiRequest('/Usuario/logout', {
        method: 'POST'
      })
    } catch (error) {
    } finally {
      localStorage.removeItem(AUTH_KEY)
      this.clearCache()
    }
  },

  isAuthenticated() {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (!raw) return false
      const session = JSON.parse(raw)
      return Boolean(session?.email)
    } catch {
      return false
    }
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (!raw) return null
      const session = JSON.parse(raw)
      return session
    } catch {
      return null
    }
  },

  _tokenCache: null,
  _cacheTimestamp: 0,
  _pendingRequest: null,

  async validateToken(forceRefresh = false) {
    try {
      if (!forceRefresh && this._tokenCache && this._isCacheValid()) {
        return this._tokenCache
      }

      if (this._pendingRequest) {
        return await this._pendingRequest
      }

      this._pendingRequest = this._performTokenValidation()
      const response = await this._pendingRequest
      
      this._pendingRequest = null
      
      return response
    } catch (error) {
      this._pendingRequest = null
      return null
    }
  },

  async _performTokenValidation() {
    try {
      const response = await apiRequest('/Usuario/me')
      
      this._tokenCache = response
      this._cacheTimestamp = Date.now()
      
      if (response && response.usuarioId) {
        const currentSession = this.getCurrentUser()
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            role: response.role,
            isAdmin: response.isAdmin,
            lastValidated: Date.now()
          }
          localStorage.setItem(AUTH_KEY, JSON.stringify(updatedSession))
        }
      }
      
      return response
    } catch (error) {
      this._tokenCache = null
      this._cacheTimestamp = 0
      localStorage.removeItem(AUTH_KEY)
      throw error
    }
  },

  _isCacheValid() {
    return (Date.now() - this._cacheTimestamp) < CACHE_DURATION
  },

  clearCache() {
    this._tokenCache = null
    this._cacheTimestamp = 0
    this._pendingRequest = null
  },

  async isAdmin() {
    try {
      const user = await this.validateToken()
      return user?.isAdmin === true
    } catch {
      return false
    }
  },

  async hasRole(requiredRole) {
    try {
      const user = await this.validateToken()
      return user?.role === requiredRole
    } catch {
      return false
    }
  }
}


