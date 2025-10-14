import { apiRequest, API_BASE_URL } from './apiConfig.js'

export function getImageUrl(imageName) {
  if (!imageName) return '/placeholder.jpg'
  if (imageName.startsWith('http')) return imageName
  return `${API_BASE_URL}/Rifa/image/${imageName}`
}

export const rafflesService = {
  async getActiveRaffles() {
    try {
      const response = await apiRequest('/Rifa/getrifasativas')
      return response || []
    } catch (error) {
      return []
    }
  },

  async getDrawnRaffles() {
    try {
      const response = await apiRequest('/Rifa/getrifas')
      return response?.filter(rifa => rifa.finalizada) || []
    } catch (error) {
      return []
    }
  },

  async getAllRaffles() {
    try {
      const response = await apiRequest('/Rifa/getrifas')
      return response || []
    } catch (error) {
      return []
    }
  },

  async getById(id) {
    try {
      const response = await apiRequest(`/Rifa/getrifa/${id}`)
      return response
    } catch (error) {
      return null
    }
  },

  async addRaffle({ title, description, imageFile, total, price }) {
    try {
      const formData = new FormData()
      formData.append('titulo', title || '')
      formData.append('descricao', description || '')
      
      const priceStr = typeof price === 'string' ? price : String(price)
      formData.append('preco', priceStr)
      formData.append('numCotas', parseInt(total).toString())
      
      if (imageFile) {
        formData.append('imagem', imageFile)
      }

      const response = await apiRequest('/Rifa/createrifa', {
        method: 'POST',
        body: formData,
        headers: {}
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async updateRaffle(id, { title, image, total, price, description }) {
    try {
      const response = await apiRequest(`/Rifa/updaterifa/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: title,
          imagem: image,
          totalCotas: total,
          valorCota: price,
          descricao: description || ''
        })
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async finishRaffle(id) {
    try {
      const response = await apiRequest(`/Rifa/finishrifa/${id}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async deleteRaffle(id) {
    try {
      const response = await apiRequest(`/Rifa/deleterifa/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}


