import { useEffect, useState } from 'react'
import { rafflesService, getImageUrl } from '../services/rifasService.js'

function DrawnRafflesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDrawnRaffles() {
      try {
        setLoading(true)
        const raffles = await rafflesService.getDrawnRaffles()
        setItems(raffles)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadDrawnRaffles()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <h2 className="page-title">Rifas sorteadas</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Carregando rifas sorteadas...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h2 className="page-title">Rifas sorteadas</h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>Erro ao carregar rifas: {error}</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2 className="page-title">Rifas sorteadas</h2>
      <div className="grid">
        {items && items.length > 0 ? (
          items.map((r) => (
            <div className="card raffle-card" key={r.id}>
              <img src={getImageUrl(r.imagem)} alt={r.titulo || 'Rifa'} />
              <div className="raffle-meta">
                <div>
                  <div style={{ fontWeight: 700 }}>{r.titulo || 'Sem título'}</div>
                  <div className="muted">
                    Sorteada em {r.dataSorteio ? new Date(r.dataSorteio).toLocaleDateString() : 'Data não disponível'}
                  </div>
                </div>
                <div className="badge">
                  Ganhador: <span style={{ color: 'green' }}>{r.ganhadorNome || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Nenhuma rifa sorteada encontrada
          </div>
        )}
      </div>
    </div>
  )
}

export default DrawnRafflesPage


