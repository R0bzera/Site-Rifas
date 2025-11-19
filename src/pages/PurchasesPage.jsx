import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { purchasesService } from '../services/purchasesService.js'
import { rafflesService, getImageUrl } from '../services/rifasService.js'
import PaymentModal from '../components/PaymentModal.jsx'

function PurchasesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [allItems, setAllItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    loadPurchases()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [allItems, activeFilter, customDateRange])

  useEffect(() => {
    const hasPendingPurchases = allItems.some(item => 
      (item.status || item.statusPagamento) === 'pending'
    )

    if (!hasPendingPurchases) return

    const interval = setInterval(() => {
      loadPurchases()
    }, 10000)

    return () => clearInterval(interval)
  }, [allItems])

  useEffect(() => {
    if (location.state?.success && location.state?.message) {
      setSuccessMessage(location.state.message)
      loadPurchases()
      setTimeout(() => setSuccessMessage(''), 5000)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const loadPurchases = async () => {
    try {
      const purchases = await purchasesService.getMyPurchases()
      setAllItems(purchases)
    } catch (error) {
      setAllItems([])
    }
  }

  const applyFilters = () => {
    if (activeFilter === 'all') {
      setFilteredItems(allItems)
      return
    }

    const now = new Date()
    let startDate = null

    switch (activeFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          const filtered = allItems.filter(item => {
            const itemDate = new Date(item.purchaseDate)
            const start = new Date(customDateRange.startDate)
            const end = new Date(customDateRange.endDate)
            end.setHours(23, 59, 59, 999)
            return itemDate >= start && itemDate <= end
          })
          setFilteredItems(filtered)
          return
        } else {
          setFilteredItems(allItems)
          return
        }
      default:
        setFilteredItems(allItems)
        return
    }

    const filtered = allItems.filter(item => {
      const itemDate = new Date(item.purchaseDate)
      return itemDate >= startDate
    })

    setFilteredItems(filtered)
  }

  const getFilterLabel = (filter) => {
    switch (filter) {
      case 'all': return 'Todas'
      case 'today': return 'Hoje'
      case '7days': return '7 dias'
      case '30days': return '30 dias'
      case 'custom': return 'Personalizado'
      default: return 'Todas'
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' }
      case 'confirmed':
        return { label: 'Confirmado', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' }
      case 'cancelled':
        return { label: 'Cancelado', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
      default:
        return { label: 'Desconhecido', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'pix': return 'PIX'
      case 'credit_card': return 'Cartão de Crédito'
      case 'debit_card': return 'Cartão de Débito'
      default: return method || 'PIX'
    }
  }

  const totalSpent = filteredItems.reduce((total, p) => {
    const price = p.valorUnitario || p.price || 0
    return total + (p.quantity * price)
  }, 0)

  const handlePayNow = (purchase) => {
    setSelectedPayment(purchase)
    setPaymentModalOpen(true)
  }

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false)
    setSelectedPayment(null)
  }

  const getLuckyNumbers = (purchase) => {
    if (purchase.cotas && purchase.cotas.length > 0) {
      return purchase.cotas.map(cota => cota.numero).sort((a, b) => a - b)
    }
    return []
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title">Minhas compras</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={loadPurchases}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'transparent',
              color: 'var(--color-text)',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ 
        marginBottom: 24, 
        padding: '16px', 
        background: 'rgba(255, 255, 255, 0.02)', 
        borderRadius: 12,
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 8, 
          alignItems: 'center',
          marginBottom: activeFilter === 'custom' ? 16 : 0
        }}>
          <span style={{ color: 'var(--color-text-dim)', fontSize: 14, marginRight: 8 }}>Filtrar por:</span>
          {['all', 'today', '7days', '30days', 'custom'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: activeFilter === filter 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'transparent',
                color: activeFilter === filter 
                  ? 'var(--color-text)' 
                  : 'var(--color-text-dim)',
                fontSize: 14,
                fontWeight: activeFilter === filter ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {getFilterLabel(filter)}
            </button>
          ))}
        </div>

        {/* Filtro personalizado */}
        {activeFilter === 'custom' && (
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 14, color: 'var(--color-text-dim)' }}>De:</label>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                  colorScheme: 'dark'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 14, color: 'var(--color-text-dim)' }}>Até:</label>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                  colorScheme: 'dark'
                }}
              />
            </div>
            <button
              onClick={() => setCustomDateRange({ startDate: '', endDate: '' })}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'transparent',
                color: 'var(--color-text-dim)',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {successMessage}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ marginBottom: 8, color: 'var(--color-text)' }}>
            {allItems.length === 0 ? 'Nenhuma compra realizada' : 'Nenhuma compra encontrada'}
          </h3>
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 24 }}>
            {allItems.length === 0 
              ? 'Você ainda não fez nenhuma compra. Explore nossas rifas!'
              : `Nenhuma compra encontrada para o período "${getFilterLabel(activeFilter)}". Tente outro filtro.`
            }
          </p>
          <button 
            className="btn" 
            onClick={() => window.location.href = '/rifas'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0-2 2 2 2 0 1 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V7z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Ver rifas disponíveis
          </button>
        </div>
      ) : (
        <div className="grid">
          {filteredItems.map((p) => {
            const statusInfo = getStatusInfo(p.status || p.statusPagamento)
            const unitPrice = p.valorUnitario || p.price || 0
            const totalPrice = p.quantity * unitPrice
            const luckyNumbers = getLuckyNumbers(p)
            const isPending = (p.status || p.statusPagamento) === 'pending'
            
            return (
              <div className="card" key={p.id} style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <img 
                    src={getImageUrl(p.imagemRifa || p.rifaImagem)} 
                    alt={p.tituloRifa || p.rifaTitulo || 'Rifa'} 
                    style={{ 
                      width: 120, 
                      height: 120, 
                      objectFit: 'cover', 
                      borderRadius: 12,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--color-text)' }}>
                      {p.tituloRifa || p.rifaTitulo || 'Rifa não encontrada'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 4,
                      marginBottom: 12
                    }}>
                      <div style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>
                        Quantidade: <strong>{p.quantity || p.quantidade}</strong> • Preço unitário: <strong>R$ {unitPrice.toFixed(2)}</strong>
                      </div>
                      <div style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>
                        Total: <strong style={{ color: 'var(--color-text)', fontSize: 16 }}>R$ {totalPrice.toFixed(2)}</strong>
                      </div>
                      {luckyNumbers.length > 0 && (
                        <div style={{ color: 'var(--color-text-dim)', fontSize: 14, marginTop: 4 }}>
                          Números da sorte: <strong style={{ color: 'var(--color-primary)' }}>
                            {luckyNumbers.join(', ')}
                          </strong>
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12,
                      marginBottom: 12
                    }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: statusInfo.bgColor,
                        color: statusInfo.color,
                        fontSize: 12,
                        fontWeight: 600,
                        border: `1px solid ${statusInfo.color}20`
                      }}>
                        <div style={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          background: statusInfo.color 
                        }}></div>
                        {statusInfo.label}
                      </div>
                      {isPending && (
                        <button
                          onClick={() => handlePayNow(p)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--color-primary)',
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = 'var(--color-primary-dark)'
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'var(--color-primary)'
                          }}
                        >
                          Pagar Agora
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 16,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Pedido</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{p.id.slice(-8)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Data da compra</div>
                    <div style={{ fontWeight: 600 }}>{formatDate(p.dataCompra || p.purchaseDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Pagamento</div>
                    <div style={{ fontWeight: 600 }}>{getPaymentMethodLabel(p.metodoPagamento || p.paymentMethod)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Pagamento */}
      {selectedPayment && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={handleClosePaymentModal}
          pedidoId={selectedPayment.id}
          rifaTitulo={selectedPayment.tituloRifa || selectedPayment.rifaTitulo}
          valorTotal={(selectedPayment.valorUnitario || selectedPayment.price || 0) * (selectedPayment.quantity || selectedPayment.totalCotas)}
        />
      )}
    </div>
  )
}

export default PurchasesPage


