import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { rafflesService, getImageUrl } from '../services/rifasService.js'
import SorteioDetector from '../components/SorteioDetector.jsx'

function RafflesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadRaffles() {
      try {
        setLoading(true)
        const raffles = await rafflesService.getActiveRaffles()
        setItems(raffles)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadRaffles()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <h2 className="page-title">Rifas ativas</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Carregando rifas...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h2 className="page-title">Rifas ativas</h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>Erro ao carregar rifas: {error}</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const handleRifaAtualizada = () => {
    // Recarregar rifas quando sorteio for concluído
    loadRaffles()
  }

  return (
    <div className="container">
      <h2 className="page-title">Rifas ativas</h2>
      <div className="grid">
        {items && items.length > 0 ? (
          items.map((r) => (
            <div className="card raffle-card" key={r.id}>
              <img src={getImageUrl(r.imagem)} alt={r.titulo || 'Rifa'} />
              <div className="raffle-meta">
                <div>
                  <div style={{ fontWeight: 700 }}>{r.titulo || 'Sem título'}</div>
                  <div className="muted">R$ {(r.preco || 0).toFixed(2)}</div>
                </div>
                <div className="badge">
                  {r.cotasDisponiveis || 0} de {r.numCotas || 0} números
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Link className="btn" to={`/rifas/${r.id}`}>Ver detalhes</Link>
              </div>
              {/* Detector de sorteio para cada rifa */}
              <SorteioDetector 
                rifa={r} 
                onRifaAtualizada={handleRifaAtualizada}
              />
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Nenhuma rifa ativa encontrada
          </div>
        )}
      </div>
    </div>
  )
}

export default RafflesPage


