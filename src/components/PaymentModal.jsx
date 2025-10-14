import React, { useState } from 'react'
import { pagamentoService } from '../services/pagamentoService.js'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function PaymentModal({ isOpen, onClose, pedidoId, rifaTitulo, valorTotal }) {
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [copied, setCopied] = useState(false)
  const { showSuccess, showError } = useNotificationContext()

  const loadPaymentData = async () => {
    if (!pedidoId || paymentData) return

    setLoading(true)
    try {
      const data = await pagamentoService.buscarPagamentoPorPedido(pedidoId)
      setPaymentData(data)
    } catch (error) {
      showError('Erro ao carregar dados do pagamento')
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = async () => {
    if (!paymentData?.qrCode) return

    try {
      await navigator.clipboard.writeText(paymentData.qrCode)
      setCopied(true)
      showSuccess('Código PIX copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      showError('Erro ao copiar código PIX')
    }
  }

  const handleModalOpen = () => {
    if (isOpen && !paymentData) {
      loadPaymentData()
    }
  }

  // Carregar dados quando o modal abrir
  React.useEffect(() => {
    handleModalOpen()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: 'var(--color-bg)',
        borderRadius: 16,
        padding: 24,
        maxWidth: 500,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: 'var(--color-text)' }}>Pagamento PIX</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-dim)',
              fontSize: 24,
              cursor: 'pointer',
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ marginBottom: 16 }}>Carregando dados do pagamento...</div>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '3px solid rgba(255, 255, 255, 0.1)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        ) : paymentData ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-dim)', marginBottom: 4 }}>Rifa</div>
              <div style={{ fontWeight: 600 }}>{rifaTitulo}</div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-dim)', marginBottom: 4 }}>Valor</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>R$ {valorTotal.toFixed(2)}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-dim)', marginBottom: 8 }}>Status</div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8,
                padding: '6px 12px',
                borderRadius: 8,
                background: paymentData.status === 'approved' 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(245, 158, 11, 0.1)',
                color: paymentData.status === 'approved' 
                  ? '#10b981' 
                  : '#f59e0b',
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${paymentData.status === 'approved' ? '#10b981' : '#f59e0b'}20`
              }}>
                <div style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: paymentData.status === 'approved' ? '#10b981' : '#f59e0b'
                }}></div>
                {paymentData.status === 'approved' ? 'Aprovado' : 'Pendente'}
              </div>
            </div>

            {paymentData.status !== 'approved' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 8 }}>Escaneie o QR Code ou copie o código PIX</h4>
                </div>
                
                {paymentData.qrCodeBase64 && (
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
                      src={`data:image/jpeg;base64,${paymentData.qrCodeBase64}`}
                      alt="QR Code PIX"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}
                
                <div style={{ marginBottom: 16 }}>
                  <button 
                    onClick={copyPixCode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-primary)',
                      background: copied ? '#10b981' : 'var(--color-primary)',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copied ? '✓ Código copiado!' : 'Copiar código PIX'}
                  </button>
                </div>

                {paymentData.qrCode && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Código PIX:</div>
                    <div style={{ 
                      fontSize: 12, 
                      fontFamily: 'monospace', 
                      wordBreak: 'break-all',
                      color: 'var(--color-text)'
                    }}>
                      {paymentData.qrCode}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ color: 'var(--color-text-dim)' }}>
              Nenhum pagamento encontrado para este pedido
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PaymentModal
