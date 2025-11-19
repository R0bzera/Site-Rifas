import { apiRequest } from './apiConfig.js'

export const sorteioService = {
  async verificarStatusSorteio(rifaId) {
    try {
      const response = await apiRequest(`/Rifa/status-sorteio/${rifaId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async executarSorteio(rifaId) {
    try {
      const response = await apiRequest(`/Rifa/sortear/${rifaId}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async gerarNumeroSorteado(rifaId) {
    try {
      const response = await apiRequest(`/Rifa/gerar-numero-sorteado/${rifaId}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  isRifaCompleta(rifa) {
    return rifa.cotasDisponiveis === 0 && rifa.numCotas > 0
  },

  async verificarSorteioAutomatico(rifaId) {
    try {
      const response = await apiRequest(`/Rifa/verificar-sorteio-automatico/${rifaId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  calcularTempoRestante(dataInicioSorteio, duracaoMinutos = 5) {
    if (!dataInicioSorteio) return null
    
    const agora = new Date()
    const dataFim = new Date(dataInicioSorteio.getTime() + (duracaoMinutos * 60 * 1000))
    const diferenca = dataFim.getTime() - agora.getTime()
    
    if (diferenca <= 0) return { segundos: 0, minutos: 0, expirado: true }
    
    const minutos = Math.floor(diferenca / (1000 * 60))
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000)
    
    return {
      segundos,
      minutos,
      totalSegundos: Math.floor(diferenca / 1000),
      expirado: false
    }
  }
}
