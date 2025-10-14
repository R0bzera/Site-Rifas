import { apiRequest } from './apiConfig.js'
import { authService } from './authService.js'

export const cotasService = {
  async getAllCotas() {
    try {
      const response = await apiRequest('/Cota/getcotas')
      return response || []
    } catch (error) {
      return []
    }
  },

  async getCotaById(id) {
    try {
      const response = await apiRequest(`/Cota/getcota/${id}`)
      return response
    } catch (error) {
      return null
    }
  },

  async getCotasByRifa(rifaId) {
    try {
      const response = await apiRequest(`/Cota/getcotasbyrifas/${rifaId}`)
      return response || []
    } catch (error) {
      return []
    }
  },

  async getCotasByUser(usuarioId) {
    try {
      const response = await apiRequest(`/Cota/getcotasbyuser/${usuarioId}`)
      return response || []
    } catch (error) {
      return []
    }
  },

  async getMyCotas() {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser?.userId) {
        throw new Error('Usuário não autenticado')
      }
      
      const response = await apiRequest(`/Cota/getcotasbyuser/${currentUser.userId}`)
      return response || []
    } catch (error) {
      return []
    }
  },

  async getOpenCotas(rifaId) {
    try {
      const response = await apiRequest(`/Cota/getcotasopen/${rifaId}`)
      return response || []
    } catch (error) {
      return []
    }
  },

  async createCota({ rifaId, numero }) {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser?.userId) {
        throw new Error('Usuário não autenticado')
      }

      const response = await apiRequest('/Cota/createcota', {
        method: 'POST',
        body: JSON.stringify({
          rifaId,
          usuarioId: currentUser.userId,
          numero
        })
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async buyCota({ rifaId, numero }) {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser?.userId) {
        throw new Error('Usuário não autenticado')
      }

      const response = await apiRequest('/Cota/buycota', {
        method: 'POST',
        body: JSON.stringify({
          rifaId,
          usuarioId: currentUser.userId,
          numero
        })
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async deleteCota(id) {
    try {
      const response = await apiRequest(`/Cota/deletecota/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}
