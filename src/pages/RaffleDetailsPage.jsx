import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { rafflesService, getImageUrl } from '../services/rifasService.js'
import { purchasesService } from '../services/purchasesService.js'
import { authService } from '../services/authService.js'

function RaffleDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [raffle, setRaffle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

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

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          Carregando detalhes da rifa...
        </div>
      </div>
    )
  }

  if (error || !raffle) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 24 }}>
          {error || 'Rifa não encontrada.'}
        </div>
      </div>
    )
  }

  const handleBuy = () => {
    if (!authService.isAuthenticated()) {
      // Redirecionar para login com opção de cadastro
      navigate('/login', { 
        state: { 
          redirectAfterAuth: `/checkout/${raffle.id}`,
          redirectData: { quantity },
          message: 'Faça login para continuar com a compra'
        } 
      })
      return
    }
    // Redirecionar para checkout com a quantidade selecionada
    navigate(`/checkout/${raffle.id}`, { state: { quantity } })
  }

  const maxQuantity = raffle.cotasDisponiveis || 0
  const price = raffle.preco || 0
  const title = raffle.titulo || 'Sem título'
  const description = raffle.descricao || ''

  return (
    <div className="container">
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <img src={getImageUrl(raffle.imagem)} alt={title} style={{ width: '100%', borderRadius: 12, marginBottom: 16 }} />
            {description && (
              <div style={{ 
                padding: 16, 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Descrição</h4>
                <p style={{ margin: 0, color: 'var(--color-text-dim)', fontSize: 14, lineHeight: 1.5 }}>
                  {description}
                </p>
              </div>
            )}
          </div>
          <div>
            <h2 className="page-title" style={{ marginTop: 0 }}>{title}</h2>
            <div className="muted">R$ {price.toFixed(2)} por número</div>
            <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="badge">{maxQuantity} disponíveis</span>
              <input 
                className="input" 
                type="number" 
                min={1} 
                max={maxQuantity} 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value) || 1)))} 
                style={{ width: 120 }} 
              />
            </div>
            <button className="btn" onClick={handleBuy}>Comprar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RaffleDetailsPage


