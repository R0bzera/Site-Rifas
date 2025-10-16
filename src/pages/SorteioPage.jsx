import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { rafflesService, getImageUrl } from '../services/rifasService.js'
import { sorteioService } from '../services/sorteioService.js'
import Roulette from '../components/Roulette.jsx'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function SorteioPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotificationContext()
  
  const [rifa, setRifa] = useState(null)
  const [statusSorteio, setStatusSorteio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fase, setFase] = useState('loading') // loading, contagem, roleta-tempo, roleta-principal, resultado
  const [tempoRestante, setTempoRestante] = useState(0)
  const [tempoSorteio, setTempoSorteio] = useState(null)
  const [numeroSorteado, setNumeroSorteado] = useState(null)
  const [ganhador, setGanhador] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [contagemIniciada, setContagemIniciada] = useState(false)
  const [tempoInicioContagem, setTempoInicioContagem] = useState(null)
  const [mostrandoResultado, setMostrandoResultado] = useState(false)
  const [tempoRestanteRoulette, setTempoRestanteRoulette] = useState(0)
  const [roletaIniciada, setRoletaIniciada] = useState(false)
  const [mostrandoResultadoPrincipal, setMostrandoResultadoPrincipal] = useState(false)
  const [roletaTempoIniciada, setRoletaTempoIniciada] = useState(false)

  // Itens para roleta de tempo (0-59 segundos) - 60 divisórias
  const itensTempo = Array.from({ length: 60 }, (_, i) => ({ 
    value: i, 
    numero: i,
    label: `${i}` 
  }))

  // Itens para roleta principal (números da rifa)
  const itensRifa = Array.from({ length: rifa?.numCotas || 0 }, (_, i) => ({ 
    value: i + 1, 
    numero: i + 1,
    label: `${i + 1}`
  }))

  useEffect(() => {
    if (id) {
      loadRifaData()
    }
  }, [id])

  useEffect(() => {
    if (tempoInicioContagem && !statusSorteio?.sorteioFinalizado) {
      calcularTempoRestante()
    }
  }, [tempoInicioContagem, statusSorteio])

  useEffect(() => {
    let interval = null
    if (fase === 'contagem' && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante((tempo) => {
          if (tempo <= 1) {
            iniciarRoletaTempo()
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

  // Cronômetro para roleta principal
  useEffect(() => {
    let interval = null
    if (fase === 'roleta-principal' && tempoSorteio && roletaIniciada && tempoRestanteRoulette > 0) {
      interval = setInterval(() => {
        setTempoRestanteRoulette((tempo) => {
          if (tempo <= 1) {
            return 0
          }
          return tempo - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fase, tempoSorteio, roletaIniciada, tempoRestanteRoulette])

  const loadRifaData = async () => {
    try {
      setLoading(true)
      
      // Carregar dados da rifa
      const rifaData = await rafflesService.getById(id)
      if (!rifaData) {
        showError('Rifa não encontrada')
        navigate('/rifas')
        return
      }
      setRifa(rifaData)

      // Carregar status do sorteio
      const status = await sorteioService.verificarStatusSorteio(id)
      setStatusSorteio(status)

      // Verificar se já existe contagem em andamento
      const chaveContagem = `contagem_rifa_${id}`
      const dadosContagem = localStorage.getItem(chaveContagem)
      
      if (dadosContagem) {
        try {
          const { tempoInicio, timestamp } = JSON.parse(dadosContagem)
          const agora = Date.now()
          const tempoDecorrido = (agora - timestamp) / 1000
          
          if (tempoDecorrido < 30 && !status.sorteioFinalizado) {
            const tempoInicioDate = new Date(tempoInicio)
            setTempoInicioContagem(tempoInicioDate)
            setContagemIniciada(true)
            setFase('contagem')
            
            // Calcular tempo restante imediatamente
            const tempoRestanteCalculado = Math.max(0, 30 - tempoDecorrido)
            setTempoRestante(Math.floor(tempoRestanteCalculado))
            
            if (tempoRestanteCalculado <= 0) {
              setFase('roleta-tempo')
              // Iniciar animação automaticamente
              setTimeout(() => {
                setIsSpinning(true)
              }, 500)
            }
          } else {
            localStorage.removeItem(chaveContagem)
            if (!status.sorteioFinalizado && status.rifaCompleta) {
              iniciarRoletaTempo()
            } else if (status.sorteioFinalizado) {
              setFase('resultado')
            } else {
              setFase('aguardando')
            }
          }
        } catch (error) {
          localStorage.removeItem(chaveContagem)
          setFase('aguardando')
        }
      } else {
        if (status.sorteioFinalizado) {
          setFase('resultado')
          setNumeroSorteado(status.numeroSorteado)
          setGanhador({
            nome: status.ganhadorNome,
            numero: status.numeroSorteado
          })
        } else if (status.rifaCompleta) {
          iniciarRoletaTempo()
        } else {
          setFase('aguardando')
        }
      }

    } catch (error) {
      showError('Erro ao carregar dados da rifa')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularTempoRestante = () => {
    if (!tempoInicioContagem) return
    
    const agora = Date.now()
    const tempoInicio = tempoInicioContagem.getTime()
    const tempoDecorrido = (agora - tempoInicio) / 1000
    const tempoRestanteCalculado = Math.max(0, 30 - tempoDecorrido)
    
    const tempoRestanteInteiro = Math.floor(tempoRestanteCalculado)
    setTempoRestante(tempoRestanteInteiro)
    
    if (tempoRestanteCalculado <= 0) {
      // Limpar dados do localStorage
      const chaveContagem = `contagem_rifa_${id}`
      localStorage.removeItem(chaveContagem)
      iniciarRoletaTempo()
    } else {
      setFase('contagem')
    }
  }

  const iniciarSorteio = () => {
    if (!statusSorteio?.rifaCompleta) {
      showError('Rifa ainda não está completa')
      return
    }

    // Salvar início da contagem
    const agora = new Date()
    setTempoInicioContagem(agora)
    setContagemIniciada(true)
    
    const chaveContagem = `contagem_rifa_${id}`
    localStorage.setItem(chaveContagem, JSON.stringify({
      tempoInicio: agora.toISOString(),
      timestamp: Date.now()
    }))
    
    setFase('contagem')
    setTempoRestante(30)
    showSuccess('Sorteio iniciado! Contagem regressiva de 30 segundos')
  }

  const iniciarRoletaTempo = () => {
    if (roletaTempoIniciada) return // Evitar múltiplas inicializações
    
    setRoletaTempoIniciada(true)
    setFase('roleta-tempo')
    // Iniciar animação automaticamente após um pequeno delay
    setTimeout(() => {
      setIsSpinning(true)
    }, 500)
  }

  const onTempoSelecionado = (itemSelecionado) => {
    setTempoSorteio(itemSelecionado.value)
    setMostrandoResultado(true)
    
    // Transição após 3 segundos de pausa
    setTimeout(() => {
      setMostrandoResultado(false)
      setFase('roleta-principal')
      setTempoRestanteRoulette(itemSelecionado.value)
      setRoletaIniciada(true)
      // Iniciar roleta principal imediatamente
      setIsSpinning(true)
    }, 3000)
  }

  const onNumeroSelecionado = async (itemSelecionado) => {
    setIsSpinning(false)
    setNumeroSorteado(itemSelecionado.numero)
    setMostrandoResultadoPrincipal(true)
    
    // Pausa de 3 segundos antes de executar o sorteio
    setTimeout(async () => {
      setMostrandoResultadoPrincipal(false)
      try {
        const resultado = await sorteioService.executarSorteio(id)
        
        setGanhador({
          nome: resultado.ganhadorNome,
          email: resultado.ganhadorEmail,
          numero: resultado.numeroSorteado
        })
        
        setFase('resultado')
        showSuccess(`Sorteio realizado! Número ${resultado.numeroSorteado} foi sorteado!`)
        
        // Limpar dados do localStorage
        const chaveContagem = `contagem_rifa_${id}`
        localStorage.removeItem(chaveContagem)
        
      } catch (error) {
        showError('Erro ao executar sorteio')
        console.error('Erro:', error)
      }
    }, 3000)
  }

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: 48, 
            marginBottom: 20,
            animation: 'spin 1s linear infinite'
          }}>
            🎰
          </div>
          <div>Carregando dados do sorteio...</div>
        </div>
      </div>
    )
  }

  if (!rifa) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Rifa não encontrada</h2>
          <button className="btn" onClick={() => navigate('/rifas')}>
            Voltar para Rifas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 40,
        padding: '20px 0',
        borderBottom: '2px solid var(--color-primary)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 36,
          color: 'var(--color-text)',
          marginBottom: 10
        }}>
          🎰 Sorteio da Rifa
        </h1>
        <h2 style={{ 
          margin: 0, 
          fontSize: 24,
          color: 'var(--color-primary)',
          fontWeight: 600
        }}>
          {rifa.titulo}
        </h2>
      </div>

      {/* Informações da Rifa */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 40,
        marginBottom: 40,
        alignItems: 'start'
      }}>
        <div>
          <img 
            src={getImageUrl(rifa.imagem)} 
            alt={rifa.titulo}
            style={{
              width: '100%',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          />
        </div>
        
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Informações da Rifa</h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: 20,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Total de Números:</strong> {rifa.numCotas}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Preço por Número:</strong> R$ {rifa.preco.toFixed(2)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Status:</strong> 
              <span style={{
                marginLeft: 8,
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: statusSorteio?.sorteioFinalizado 
                  ? 'rgba(16, 185, 129, 0.1)'
                  : statusSorteio?.rifaCompleta 
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'rgba(107, 114, 128, 0.1)',
                color: statusSorteio?.sorteioFinalizado 
                  ? '#10b981'
                  : statusSorteio?.rifaCompleta 
                  ? '#f59e0b'
                  : '#6b7280'
              }}>
                {statusSorteio?.sorteioFinalizado 
                  ? 'Sorteada' 
                  : statusSorteio?.rifaCompleta 
                  ? 'Pronta para sorteio'
                  : 'Em andamento'
                }
              </span>
            </div>
            {statusSorteio?.sorteioFinalizado && ganhador && (
              <div style={{
                marginTop: 16,
                padding: 16,
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 8,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: 8 }}>
                  🏆 Ganhador
                </div>
                <div><strong>Nome:</strong> {ganhador.nome}</div>
                <div><strong>Número:</strong> {ganhador.numero}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área do Sorteio */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        padding: 40,
        borderRadius: 20,
        border: '2px solid var(--color-primary)',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {fase === 'aguardando' && (
          <div>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
            <h3 style={{ marginBottom: 20 }}>Aguardando Rifa Completar</h3>
            <p style={{ color: 'var(--color-text-dim)', marginBottom: 20 }}>
              A rifa precisa estar 100% vendida para iniciar o sorteio
            </p>
            <div style={{ fontSize: 14, color: 'var(--color-text-dim)' }}>
              Vendidos: {rifa.numCotas - rifa.cotasDisponiveis} de {rifa.numCotas} números
            </div>
          </div>
        )}

        {fase === 'contagem' && (
          <div>
            <div style={{ 
              fontSize: 72, 
              fontWeight: 'bold', 
              color: 'var(--color-primary)',
              marginBottom: 20,
              fontFamily: 'monospace'
            }}>
              {formatarTempo(tempoRestante)}
            </div>
            <h3 style={{ marginBottom: 20 }}>Sorteio Iniciará Em...</h3>
            <p style={{ color: 'var(--color-text-dim)' }}>
              Prepare-se! O sorteio começará automaticamente
            </p>
          </div>
        )}

        {fase === 'roleta-tempo' && (
          <div>
            <h3 style={{ marginBottom: 20 }}>
              🕒 Determinando tempo de rotação
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Roulette
                items={itensTempo}
                isSpinning={isSpinning}
                onSpinComplete={onTempoSelecionado}
                duration={3000}
                size={500}
              />
            </div>
            {mostrandoResultado ? (
              <div style={{ 
                color: 'var(--color-primary)', 
                fontSize: 18, 
                fontWeight: 'bold',
                marginBottom: 10
              }}>
                Tempo selecionado: {tempoSorteio} segundos
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-dim)' }}>
                A roleta determinará por quanto tempo a roleta principal girará
              </p>
            )}
          </div>
        )}

        {fase === 'roleta-principal' && (
          <div>
            <h3 style={{ marginBottom: 20 }}>
              🎯 Sorteando número vencedor
            </h3>
            {tempoSorteio && (
              <div style={{ 
                fontSize: 18, 
                color: 'var(--color-primary)', 
                marginBottom: 20,
                fontWeight: 600
              }}>
                Tempo de rotação: {tempoSorteio} segundos
              </div>
            )}
            {roletaIniciada && tempoRestanteRoulette > 0 && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                marginBottom: 20,
                border: '1px solid var(--color-primary)'
              }}>
                <span style={{ 
                  fontSize: 16, 
                  color: 'var(--color-text)', 
                  marginRight: 8
                }}>
                  ⏱️
                </span>
                <span style={{ 
                  fontSize: 16, 
                  color: 'var(--color-primary)', 
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}>
                  {tempoRestanteRoulette}s
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Roulette
                items={itensRifa}
                isSpinning={isSpinning}
                onSpinComplete={onNumeroSelecionado}
                duration={tempoSorteio ? tempoSorteio * 1000 : 5000}
                size={600}
              />
            </div>
            {mostrandoResultadoPrincipal ? (
              <div style={{ 
                color: 'var(--color-primary)', 
                fontSize: 18, 
                fontWeight: 'bold',
                marginBottom: 10
              }}>
                Número sorteado: {numeroSorteado}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-dim)' }}>
                Descobrindo o número da sorte...
              </p>
            )}
          </div>
        )}

        {fase === 'resultado' && (
          <div>
            <div style={{ 
              fontSize: 72, 
              marginBottom: 20,
              color: 'var(--color-primary)'
            }}>
              🎉
            </div>
            <h3 style={{ marginBottom: 20 }}>
              Sorteio Concluído!
            </h3>
            <div style={{ 
              fontSize: 96, 
              fontWeight: 'bold', 
              color: 'var(--color-primary)',
              marginBottom: 30,
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
                marginBottom: 20,
                maxWidth: '400px',
                margin: '0 auto 20px'
              }}>
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  color: '#10b981',
                  fontSize: 20
                }}>
                  🏆 Ganhador
                </h4>
                <div style={{ fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>
                  <strong>{ganhador.nome}</strong>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-dim)' }}>
                  Número da sorte: {ganhador.numero}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão para iniciar sorteio manualmente */}
        {fase === 'aguardando' && statusSorteio?.rifaCompleta && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={iniciarSorteio}
              className="btn"
              style={{ fontSize: 18, padding: '12px 24px' }}
            >
              Iniciar Sorteio
            </button>
          </div>
        )}
      </div>

      {/* Botão voltar */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <button 
          className="btn" 
          onClick={() => navigate('/rifas')}
          style={{ background: 'transparent', border: '1px solid var(--color-text-dim)' }}
        >
          Voltar para Rifas
        </button>
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

export default SorteioPage
