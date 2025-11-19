import { apiRequest } from './apiConfig.js'

export const pagamentoService = {
  /**
   * Obter a Public Key do Mercado Pago
   */
  async getPublicKey() {
    try {
      const response = await apiRequest('/Pagamento/public-key')
      return response.publicKey
    } catch (error) {
      throw error
    }
  },

  /**
   * Criar um pagamento PIX
   * @param {Object} dados - Dados do pagamento
   * @param {string} dados.rifaId - ID da rifa
   * @param {number} dados.quantidade - Quantidade de números
   * @param {number} dados.precoUnitario - Preço unitário da rifa
   * @param {number} dados.amount - Valor total do pagamento
   * @param {string} dados.emailPagador - Email do pagador
   * @param {string} dados.nomePagador - Nome do pagador
   * @param {string} dados.sobrenomePagador - Sobrenome do pagador
   * @param {string} dados.cpf - CPF do pagador (apenas dígitos)
   * @param {string} dados.usuarioId - ID do usuário
   * @param {string} [dados.cep] - CEP (opcional)
   * @param {string} [dados.rua] - Rua (opcional)
   * @param {string} [dados.numero] - Número (opcional)
   * @param {string} [dados.bairro] - Bairro (opcional)
   * @param {string} [dados.cidade] - Cidade (opcional)
   * @param {string} [dados.estado] - Estado (opcional)
   */
  async criarPagamentoPix(dados) {
    try {
      const dadosPagamento = {
        amount: dados.amount || (dados.quantidade * (dados.precoUnitario || 0)),
        email: dados.emailPagador,
        firstName: dados.nomePagador,
        lastName: dados.sobrenomePagador,
        documentType: "CPF",
        documentNumber: dados.cpf.replace(/\D/g, ''),
        description: `Pagamento de ${dados.quantidade} número(s) da rifa`,
        
        rifaId: dados.rifaId,
        usuarioId: dados.usuarioId,
        quantidadeCotas: dados.quantidade
      }

      const response = await apiRequest('/Payment/pix', {
        method: 'POST',
        body: JSON.stringify(dadosPagamento)
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Consultar status de um pagamento
   * @param {number} pagamentoId - ID do pagamento no Mercado Pago
   */
  async consultarPagamento(pagamentoId) {
    try {
      const response = await apiRequest(`/Payment/consultar/${pagamentoId}`)
      
      if (response && response.payment) {
        return {
          ...response.payment,
          message: response.message,
          orderUpdated: response.orderUpdated
        }
      }
      
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Buscar dados do pagamento por ID do pedido
   * @param {string} pedidoId - ID do pedido
   */
  async buscarPagamentoPorPedido(pedidoId) {
    try {
      const response = await apiRequest(`/Payment/by-pedido/${pedidoId}`)
      
      if (response && response.payment) {
        return {
          ...response.payment,
          paymentOrderId: response.paymentOrderId,
          pedidoId: response.pedidoId
        }
      }
      
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Polling para verificar status de pagamento
   * @param {number} pagamentoId - ID do pagamento no Mercado Pago
   * @param {function} onStatusChange - Callback chamado quando status muda
   * @param {number} intervalMs - Intervalo entre consultas (padrão: 5000ms)
   * @param {number} maxTentativas - Máximo de tentativas (padrão: 120 = 10 minutos)
   */
  iniciarVerificacaoPagamento(pagamentoId, onStatusChange, intervalMs = 5000, maxTentativas = 120) {
    let tentativas = 0
    let statusAnterior = null

    const interval = setInterval(async () => {
      try {
        tentativas++
        
        if (tentativas > maxTentativas) {
          clearInterval(interval)
          onStatusChange({ status: 'timeout', message: 'Tempo limite excedido' })
          return
        }

        const resultado = await this.consultarPagamento(pagamentoId)
        
        if (resultado.status !== statusAnterior) {
          statusAnterior = resultado.status
          onStatusChange(resultado)
        }

        if (['approved', 'rejected', 'cancelled'].includes(resultado.status)) {
          clearInterval(interval)
        }
      } catch (error) {
      }
    }, intervalMs)

    return () => clearInterval(interval)
  },

  /**
   * Processar notificação de webhook do Mercado Pago
   * @param {Object} webhookData - Dados do webhook
   */
  async processarWebhook(webhookData) {
    try {
      const response = await apiRequest('/Webhook/mercado-pago', {
        method: 'POST',
        body: JSON.stringify(webhookData)
      })
      return response
    } catch (error) {
      throw error
    }
  }
}

/**
 * Utilidades para validação
 */
export const validacoes = {
  /**
   * Validar CPF
   * @param {string} cpf - CPF com ou sem formatação
   */
  validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '')
    
    if (cpf.length !== 11) return false
    if (/^(\d)\1+$/.test(cpf)) return false
    
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf[i]) * (10 - i)
    }
    let resto = soma % 11
    let digito1 = resto < 2 ? 0 : 11 - resto
    
    if (parseInt(cpf[9]) !== digito1) return false
    
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf[i]) * (11 - i)
    }
    resto = soma % 11
    let digito2 = resto < 2 ? 0 : 11 - resto
    
    return parseInt(cpf[10]) === digito2
  },

  /**
   * Formatar CPF
   * @param {string} cpf - CPF com ou sem formatação
   */
  formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '')
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  /**
   * Formatar CEP
   * @param {string} cep - CEP com ou sem formatação
   */
  formatarCEP(cep) {
    cep = cep.replace(/\D/g, '')
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
}

