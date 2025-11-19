import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { rafflesService, getImageUrl } from '../services/rifasService.js'
import { authService } from '../services/authService.js'
import { pagamentoService, validacoes } from '../services/pagamentoService.js'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function CheckoutPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccess, showError } = useNotificationContext()
  
  const [raffle, setRaffle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [cpf, setCpf] = useState('')
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  
  const [pagamento, setPagamento] = useState(null)
  const [criandoPagamento, setCriandoPagamento] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cancelarVerificacao, setCancelarVerificacao] = useState(null)
  
  const { quantity = 1 } = location.state || {}
  useEffect(() => {
    async function loadRaffle() {
      try {
        setLoading(true)
        const raffleData = await rafflesService.getById(id)
        setRaffle(raffleData)
        if (!raffleData) {
          setError('Rifa não encontrada')
        }
      } catch (err) {
        setError('Erro ao carregar rifa')
      } finally {
        setLoading(false)
      }
    }
    
    loadRaffle()
  }, [id])
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: `/checkout/${id}` } })
      return
    }

    const userData = authService.getCurrentUser()
    if (userData) {
      setEmail(userData.email || '')
      setNome(userData.nome?.split(' ')[0] || '')
      setSobrenome(userData.nome?.split(' ').slice(1).join(' ') || '')
    }
  }, [id, navigate])

  useEffect(() => {
    return () => {
      if (cancelarVerificacao) {
        cancelarVerificacao()
      }
    }
  }, [cancelarVerificacao])
  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Carregando dados da rifa...</div>
        </div>
      </div>
    )
  }

  if (error || !raffle) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <h2>Rifa não encontrada</h2>
          <p>Volte para a página de rifas e tente novamente.</p>
          <button className="btn" onClick={() => navigate('/rifas')}>
            Voltar para Rifas
          </button>
        </div>
      </div>
    )
  }

  const handleCPFChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '')
    const formatado = validacoes.formatarCPF(valor)
    setCpf(formatado)
  }

    const handleCriarPagamento = async (e) => {
    e.preventDefault()

    if (!nome || !sobrenome || !email || !cpf) {
      showError('Por favor, preencha todos os campos')
      return
    }

    if (!validacoes.validarCPF(cpf)) {
      showError('CPF inválido')
      return
    }

    const currentUser = authService.getCurrentUser()
    if (!currentUser || !currentUser.userId) {
      showError('Você precisa estar logado para fazer uma compra')
      navigate('/login', { state: { from: `/checkout/${id}` } })
      return
    }

    setCriandoPagamento(true)

    try {
      const dadosPagamento = {
        rifaId: raffle.id,
        quantidade: quantity,
        precoUnitario: raffle.preco,
        amount: totalPrice,
        emailPagador: email,
        nomePagador: nome,
        sobrenomePagador: sobrenome,
        cpf: cpf,
        usuarioId: currentUser?.userId
      }

      const resultado = await pagamentoService.criarPagamentoPix(dadosPagamento)

      if (resultado.status === 'error') {
        showError(resultado.mensagemErro || 'Erro ao criar pagamento')
        return
      }

      setPagamento(resultado)
      showSuccess('Pagamento criado! Escaneie o QR Code ou copie o código PIX')

      const cancelFunc = pagamentoService.iniciarVerificacaoPagamento(
        resultado.id,
        (statusAtualizado) => {
          if (statusAtualizado.status === 'approved') {
            const message = statusAtualizado.message || 'Pagamento aprovado!'
            showSuccess(message)
            setTimeout(() => {
              navigate('/minhas-compras', {
                state: {
                  success: true,
                  message: message
                }
              })
            }, 2000)
          } else if (statusAtualizado.status === 'rejected') {
            showError('Pagamento rejeitado')
          } else if (statusAtualizado.status === 'cancelled') {
            showError('Pagamento cancelado')
          } else if (statusAtualizado.status === 'timeout') {
            showError('Tempo limite excedido para verificação do pagamento')
          }
        }
      )

      setCancelarVerificacao(() => cancelFunc)
    } catch (error) {
      showError(error.message || 'Erro ao criar pagamento')
    } finally {
      setCriandoPagamento(false)
    }
  }

  const copyPixCode = async () => {
    if (!pagamento || !pagamento.qrCode) return
    
    try {
      await navigator.clipboard.writeText(pagamento.qrCode)
      setCopied(true)
      showSuccess('Código PIX copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = pagamento.qrCode
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        showSuccess('Código PIX copiado!')
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        showError('Erro ao copiar código PIX')
      }
      document.body.removeChild(textArea)
    }
  }


  const unitPrice = raffle.preco || 0
  const totalPrice = quantity * unitPrice

  return (
    <div className="container">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 className="page-title">Finalizar Compra</h2>
        
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Resumo da Compra</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <img 
              src={getImageUrl(raffle.imagem)} 
              alt={raffle.titulo || 'Rifa'} 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 8, 
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }} 
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, marginBottom: 4 }}>{raffle.titulo || 'Sem título'}</h4>
              <p style={{ margin: 0, color: 'var(--color-text-dim)', fontSize: 14 }}>
                R$ {unitPrice.toFixed(2)} por número
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 16,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Quantidade</div>
              <div style={{ fontWeight: 600 }}>{quantity} números</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Valor unitário</div>
              <div style={{ fontWeight: 600 }}>R$ {unitPrice.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Total</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text)' }}>
                R$ {totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Dados para Pagamento</h3>
          
          <form onSubmit={handleCriarPagamento}>
            <div className="form-row">
              <label>Nome *</label>
              <input
                className="input"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                disabled={!!pagamento}
              />
            </div>

            <div className="form-row">
              <label>Sobrenome *</label>
              <input
                className="input"
                type="text"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                placeholder="Seu sobrenome"
                required
                disabled={!!pagamento}
              />
            </div>

            <div className="form-row">
              <label>Email *</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={!!pagamento}
              />
            </div>

            <div className="form-row">
              <label>CPF *</label>
              <input
                className="input"
                inputMode="numeric"
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                required
                disabled={!!pagamento}
                maxLength={14}
              />
            </div>

            {!pagamento ? (
              <div style={{ marginTop: 24 }}>
                <button 
                  type="submit" 
                  className="btn" 
                  disabled={criandoPagamento}
                  style={{ width: '100%' }}
                >
                  {criandoPagamento ? 'Gerando pagamento...' : 'Gerar pagamento PIX'}
                </button>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginTop: 24
              }}>
                <h4 style={{ marginTop: 0, marginBottom: 16 }}>Pagamento PIX</h4>
                
                {pagamento.qrCodeBase64 && (
                  <div style={{
                    width: 250,
                    height: 250,
                    margin: '0 auto 16px',
                    background: 'white',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10
                  }}>
                    <img 
                      src={`data:image/jpeg;base64,${pagamento.qrCodeBase64}`}
                      alt="QR Code PIX"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                    R$ {totalPrice.toFixed(2)}
                  </div>
                  <div style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>
                    Escaneie o QR code com seu app do banco
                  </div>
                  <div style={{ 
                    color: 'var(--color-text-dim)', 
                    fontSize: 12, 
                    marginTop: 4,
                    fontStyle: 'italic'
                  }}>
                    O pagamento será confirmado automaticamente
                  </div>
                  <div style={{ 
                    color: 'rgba(245, 158, 11, 0.8)', 
                    fontSize: 12, 
                    marginTop: 8,
                    fontWeight: 500
                  }}>
                    Aguardando pagamento...
                  </div>
                  
                  {pagamento.numerosSorte && pagamento.numerosSorte.length > 0 && (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 16
                    }}>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: 'rgb(34, 197, 94)',
                        marginBottom: 8
                      }}>
                        🎯 Seus números da sorte:
                      </div>
                      <div style={{ 
                        fontSize: 16, 
                        fontWeight: 700,
                        color: 'rgb(34, 197, 94)'
                      }}>
                        {pagamento.numerosSorte.join(', ')}
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        color: 'rgba(34, 197, 94, 0.7)',
                        marginTop: 4
                      }}>
                        Reservados até confirmação do pagamento
                      </div>
                    </div>
                  )}
                </div>
                
                {pagamento.qrCode && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      gap: 12
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>
                          Código PIX (copie e cole no seu app)
                        </div>
                        <div style={{ 
                          fontFamily: 'monospace', 
                          fontSize: 10, 
                          wordBreak: 'break-all',
                          color: 'var(--color-text)',
                          maxHeight: 60,
                          overflow: 'auto'
                        }}>
                          {pagamento.qrCode}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={copyPixCode}
                        className="btn"
                        style={{
                          padding: '8px 12px',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                          minWidth: 'auto'
                        }}
                      >
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: 24 }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => navigate(-1)}
                disabled={criandoPagamento}
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
