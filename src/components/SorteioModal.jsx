import React, { useState, useEffect } from 'react'
import Roulette from './Roulette.jsx'
import { sorteioService } from '../services/sorteioService.js'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function SorteioModal({ isOpen, onClose, rifa, onSorteioCompleto, tempoInicioContagem }) {
  const [fase, setFase] = useState('contagem') // contagem, roleta-tempo, roleta-principal, resultado
  const [tempoRestante, setTempoRestante] = useState(0)
  const [tempoSorteio, setTempoSorteio] = useState(null)
  const [numeroSorteado, setNumeroSorteado] = useState(null)
  const [ganhador, setGanhador] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const { showSuccess, showError } = useNotificationContext()

  // Itens para roleta de tempo (0-60 segundos)
  const itensTempo = Array.from({ length: 61 }, (_, i) => ({ value: i, label: `${i}s` }))

  // Itens para roleta principal (números da rifa)
  const itensRifa = Array.from({ length: rifa?.numCotas || 0 }, (_, i) => ({ 
    value: i + 1, 
    numero: i + 1 
  }))

  useEffect(() => {
    if (isOpen && rifa && tempoInicioContagem) {
      calcularTempoRestante()
    }
  }, [isOpen, rifa, tempoInicioContagem])

  useEffect(() => {
    if (isOpen && tempoInicioContagem) {
      calcularTempoRestante()
    }
  }, [isOpen, tempoInicioContagem])

  useEffect(() => {
    let interval = null
    if (fase === 'contagem' && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante((tempo) => {
          if (tempo <= 1) {
            setFase('roleta-tempo')
            return 0
          }
          return tempo - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fase, tempoRestante])

  const calcularTempoRestante = () => {
    if (!tempoInicioContagem) return
    
    const agora = Date.now()
    const tempoInicio = tempoInicioContagem.getTime()
    const tempoDecorrido = (agora - tempoInicio) / 1000
    const tempoRestanteCalculado = Math.max(0, 30 - tempoDecorrido) // 30 segundos para teste
    
    setTempoRestante(Math.floor(tempoRestanteCalculado))
    
    // Se o tempo acabou, iniciar roleta de tempo
    if (tempoRestanteCalculado <= 0) {
      setFase('roleta-tempo')
    } else {
      setFase('contagem')
    }
  }

  const iniciarRoletaTempo = () => {
    setFase('roleta-tempo')
    setIsSpinning(true)
  }

  const onTempoSelecionado = (itemSelecionado) => {
    setTempoSorteio(itemSelecionado.value)
    setFase('roleta-principal')
    setIsSpinning(false)
    
    // Iniciar roleta principal após um pequeno delay
    setTimeout(() => {
      setIsSpinning(true)
    }, 500)
  }

  const onNumeroSelecionado = async (itemSelecionado) => {
    setIsSpinning(false)
    setNumeroSorteado(itemSelecionado.numero)
    
    try {
      // Executar sorteio no backend
      const resultado = await sorteioService.executarSorteio(rifa.id)
      
      setGanhador({
        nome: resultado.ganhadorNome,
        email: resultado.ganhadorEmail,
        numero: resultado.numeroSorteado
      })
      
      setFase('resultado')
      showSuccess(`Sorteio realizado! Número ${resultado.numeroSorteado} foi sorteado!`)
      
      // Notificar componente pai
      if (onSorteioCompleto) {
        onSorteioCompleto(resultado)
      }
    } catch (error) {
      showError('Erro ao executar sorteio')
      console.error('Erro:', error)
    }
  }

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`
  }

  if (!isOpen || !rifa) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: 'var(--color-bg)',
        borderRadius: 20,
        padding: 40,
        maxWidth: 800,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '2px solid var(--color-primary)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 30 }}>
          <h2 style={{ 
            margin: 0, 
            color: 'var(--color-text)', 
            fontSize: 28,
            marginBottom: 10
          }}>
            🎰 Sorteio da Rifa
          </h2>
          <h3 style={{ 
            margin: 0, 
            color: 'var(--color-primary)', 
            fontSize: 20,
            fontWeight: 600
          }}>
            {rifa.titulo}
          </h3>
        </div>

        {/* Conteúdo baseado na fase */}
        {fase === 'contagem' && (
          <div>
            <div style={{ 
              fontSize: 48, 
              fontWeight: 'bold', 
              color: 'var(--color-primary)',
              marginBottom: 20,
              fontFamily: 'monospace'
            }}>
              {formatarTempo(tempoRestante)}
            </div>
            <div style={{ fontSize: 18, color: 'var(--color-text-dim)' }}>
              Sorteio iniciará em...
            </div>
          </div>
        )}

        {fase === 'roleta-tempo' && (
          <div>
            <h4 style={{ 
              marginBottom: 20, 
              color: 'var(--color-text)',
              fontSize: 20
            }}>
              🕒 Determinando tempo de rotação
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Roulette
                items={itensTempo}
                isSpinning={isSpinning}
                onSpinComplete={onTempoSelecionado}
                duration={3000}
                size={250}
              />
            </div>
            <div style={{ fontSize: 16, color: 'var(--color-text-dim)' }}>
              A roleta determinará por quanto tempo a roleta principal girará
            </div>
          </div>
        )}

        {fase === 'roleta-principal' && (
          <div>
            <h4 style={{ 
              marginBottom: 20, 
              color: 'var(--color-text)',
              fontSize: 20
            }}>
              🎯 Sorteando número vencedor
            </h4>
            {tempoSorteio && (
              <div style={{ 
                fontSize: 16, 
                color: 'var(--color-primary)', 
                marginBottom: 10,
                fontWeight: 600
              }}>
                Tempo de rotação: {tempoSorteio} segundos
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Roulette
                items={itensRifa}
                isSpinning={isSpinning}
                onSpinComplete={onNumeroSelecionado}
                duration={tempoSorteio ? tempoSorteio * 1000 : 5000}
                size={350}
              />
            </div>
            <div style={{ fontSize: 16, color: 'var(--color-text-dim)' }}>
              Descobrindo o número da sorte...
            </div>
          </div>
        )}

        {fase === 'resultado' && (
          <div>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 20,
              color: 'var(--color-primary)',
              fontWeight: 'bold'
            }}>
              🎉
            </div>
            <h4 style={{ 
              marginBottom: 20, 
              color: 'var(--color-text)',
              fontSize: 24
            }}>
              Número Sorteado!
            </h4>
            <div style={{ 
              fontSize: 72, 
              fontWeight: 'bold', 
              color: 'var(--color-primary)',
              marginBottom: 20,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {numeroSorteado}
            </div>
            {ganhador && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 12,
                padding: 20,
                marginBottom: 20
              }}>
                <h5 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#10b981',
                  fontSize: 18
                }}>
                  🏆 Ganhador
                </h5>
                <div style={{ fontSize: 16, color: 'var(--color-text)' }}>
                  <strong>{ganhador.nome}</strong>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-dim)', marginTop: 5 }}>
                  {ganhador.email}
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: '1px solid var(--color-primary)',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Fechar
            </button>
          </div>
        )}

        {/* Botão de fechar (apenas nas primeiras fases) */}
        {fase !== 'resultado' && fase !== 'roleta-principal' && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
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
        )}
      </div>
    </div>
  )
}

export default SorteioModal
