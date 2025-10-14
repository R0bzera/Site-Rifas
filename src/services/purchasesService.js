import { apiRequest } from './apiConfig.js'
import { authService } from './authService.js'

export const purchasesService = {
  async getMyPurchases() {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser?.userId) {
        throw new Error('Usuário não autenticado')
      }
      
      const response = await apiRequest(`/Pedido/getpedidosbyuser/${currentUser.userId}`)
      return response || []
    } catch (error) {
      return []
    }
  },

  async getAllPurchases() {
    try {
      const response = await apiRequest('/Pedido/getpedidos')
      return response || []
    } catch (error) {
      return []
    }
  },

  async getPurchaseById(id) {
    try {
      const response = await apiRequest(`/Pedido/getpedido/${id}`)
      return response
    } catch (error) {
      return null
    }
  },

  async createPurchase({ rifaId, cotas }) {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser?.userId) {
        throw new Error('Usuário não autenticado')
      }

      const response = await apiRequest('/Pedido/createpedido', {
        method: 'POST',
        body: JSON.stringify({
          rifaId,
          usuarioId: currentUser.userId,
          cotas: cotas
        })
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async confirmPayment(id) {
    try {
      const response = await apiRequest(`/Pedido/confirmpagamento/${id}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async deletePurchase(id) {
    try {
      const response = await apiRequest(`/Pedido/deletepedido/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}


