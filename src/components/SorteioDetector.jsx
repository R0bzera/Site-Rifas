import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sorteioService } from '../services/sorteioService.js'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function SorteioDetector({ rifa, onRifaAtualizada }) {
  const navigate = useNavigate()
  const [statusSorteio, setStatusSorteio] = useState(null)
  const [contagemIniciada, setContagemIniciada] = useState(false)
  const [tempoInicioContagem, setTempoInicioContagem] = useState(null)
  const { showSuccess } = useNotificationContext()

  // Verificar se já existe contagem em andamento no localStorage
  useEffect(() => {
    if (!rifa) return

    const chaveContagem = `contagem_rifa_${rifa.id}`
    const dadosContagem = localStorage.getItem(chaveContagem)
    
    if (dadosContagem) {
      try {
        const { tempoInicio, timestamp } = JSON.parse(dadosContagem)
        const agora = Date.now()
        const tempoDecorrido = (agora - timestamp) / 1000 // em segundos
        
        // Se ainda não passou 30 segundos (para teste)
        if (tempoDecorrido < 30) {
          setContagemIniciada(true)
          setTempoInicioContagem(new Date(tempoInicio))
        } else {
          // Limpar dados expirados
          localStorage.removeItem(chaveContagem)
        }
      } catch (error) {
        localStorage.removeItem(chaveContagem)
      }
    }
  }, [rifa])

  // Verificar status da rifa periodicamente
  useEffect(() => {
    if (!rifa) return

    const verificarStatus = async () => {
      try {
        const status = await sorteioService.verificarStatusSorteio(rifa.id)
        setStatusSorteio(status)
        
        // Verificar se rifa está completa para sorteio automático
        if (status.rifaCompleta && !status.sorteioFinalizado && !contagemIniciada) {
          const agora = new Date()
          setTempoInicioContagem(agora)
          setContagemIniciada(true)
          
          // Salvar no localStorage
          const chaveContagem = `contagem_rifa_${rifa.id}`
          localStorage.setItem(chaveContagem, JSON.stringify({
            tempoInicio: agora.toISOString(),
            timestamp: Date.now()
          }))
          
          showSuccess('🎰 Rifa completa! Caça-níquel será iniciado em 30 segundos!')
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }

    // Verificar imediatamente
    verificarStatus()

    // Verificar a cada 10 segundos
    const interval = setInterval(verificarStatus, 10000)

    return () => clearInterval(interval)
  }, [rifa, contagemIniciada])

  const handleIrParaSorteio = () => {
    navigate(`/rifas/${rifa.id}/sorteio`)
  }

  const handleSorteioCompleto = () => {
    if (onRifaAtualizada) {
      onRifaAtualizada()
    }
  }

  if (!rifa || !statusSorteio) return null

  return (
    <>
      {/* Indicador visual quando rifa está completa */}
      {(contagemIniciada || (statusSorteio && statusSorteio.rifaCompleta && !statusSorteio.sorteioFinalizado)) && (
        <div style={{
          position: 'fixed',
          top: 80, // Mudado de 20 para 80 para evitar conflito com botão de sair
          right: 20,
          background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 999,
          animation: contagemIniciada ? 'none' : 'pulse 2s infinite',
          cursor: 'pointer',
          maxWidth: '200px'
        }} onClick={handleIrParaSorteio}>
          <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
            {contagemIniciada ? '⏰ Sorteio em breve!' : '🎰 Caça-níquel Disponível!'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {contagemIniciada ? 'Clique para acompanhar' : 'Clique para ir ao sorteio'}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  )
}

export default SorteioDetector
