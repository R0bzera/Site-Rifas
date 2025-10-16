import React, { useState, useEffect, useRef } from 'react'

function Roulette({ 
  items = [], 
  isSpinning = false, 
  onSpinComplete = () => {}, 
  duration = 5000,
  size = 300,
  showPointer = true 
}) {
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const rouletteRef = useRef(null)
  const animationRef = useRef(null)

  // Calcular ângulo por item
  const anglePerItem = 360 / items.length

  // Gerar cores para os segmentos - mais cores para melhor distribuição
  const generateColors = (count) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84',
      '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e',
      '#e17055', '#81ecec', '#74b9ff', '#a29bfe', '#fd79a8', '#fdcb6e'
    ]
    const result = []
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length])
    }
    return result
  }

  const colors = generateColors(items.length)

  // Efeito para iniciar a animação
  useEffect(() => {
    if (isSpinning && !isAnimating) {
      startSpin()
    }
  }, [isSpinning]) // Removido isAnimating das dependências

  const startSpin = () => {
    if (isAnimating) return // Evitar múltiplas animações
    
    console.log('🎰 Iniciando roleta - Items:', items.length, 'Duração:', duration)
    setIsAnimating(true)
    
    // Selecionar item aleatório primeiro
    const randomItemIndex = Math.floor(Math.random() * items.length)
    const selectedItem = items[randomItemIndex]
    
    // Calcular rotação para que o ponteiro aponte para o item selecionado
    // O ponteiro está no topo (0°), então precisamos calcular o ângulo do centro do item
    const itemCenterAngle = randomItemIndex * anglePerItem + (anglePerItem / 2)
    
    // Adicionar múltiplas voltas completas + ângulo para parar no item correto
    const fullRotations = 5 + Math.random() * 3 // Entre 5 e 8 voltas completas
    const finalRotation = rotation + (fullRotations * 360) + (360 - itemCenterAngle)
    
    console.log('🎰 Item alvo:', selectedItem, 'Índice:', randomItemIndex, 'Ângulo centro:', itemCenterAngle, 'Rotação final:', finalRotation)
    setRotation(finalRotation)

    // Usar o item já selecionado (mais confiável)
    setTimeout(() => {
      setIsAnimating(false)
      
      console.log('🎰 Item confirmado:', selectedItem, 'Índice:', randomItemIndex)
      
      // Pausa de 3 segundos antes de mostrar o resultado
      setTimeout(() => {
        onSpinComplete(selectedItem)
      }, 3000)
    }, duration)
  }


  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        ref={rouletteRef}
        width={size}
        height={size}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isAnimating ? `transform ${duration}ms cubic-bezier(0.23, 1, 0.32, 1)` : 'none',
          transformOrigin: 'center center'
        }}
      >
        {/* Definir gradientes para cada cor */}
        <defs>
          {colors.map((color, index) => (
            <radialGradient key={index} id={`gradient-${index}`}>
              <stop offset="0%" stopColor={lightenColor(color, 20)} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          ))}
        </defs>

        {/* Desenhar segmentos */}
        {items.map((item, index) => {
          // Calcular ângulos matematicamente precisos
          const startAngle = index * anglePerItem
          const endAngle = (index + 1) * anglePerItem
          const radius = size / 2 - 25 // Mais espaço para os números
          const centerX = size / 2
          const centerY = size / 2

          // Converter para radianos
          const startAngleRad = (startAngle * Math.PI) / 180
          const endAngleRad = (endAngle * Math.PI) / 180

          // Calcular pontos do arco
          const x1 = centerX + radius * Math.cos(startAngleRad)
          const y1 = centerY + radius * Math.sin(startAngleRad)
          const x2 = centerX + radius * Math.cos(endAngleRad)
          const y2 = centerY + radius * Math.sin(endAngleRad)

          // Determinar se é um arco grande (>180°)
          const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

          // Criar path SVG para o segmento
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')

          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index]}
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth="1"
            />
          )
        })}

        {/* Adicionar borda externa */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="3"
        />

        {/* Adicionar círculo central */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size > 500 ? "25" : size > 400 ? "20" : "15"}
          fill="rgba(0, 0, 0, 0.8)"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="2"
        />

        {/* Números sem contorno - dentro do SVG para girar junto */}
        {items.map((item, index) => {
          const angle = index * anglePerItem + (anglePerItem / 2)
          const radians = (angle * Math.PI) / 180
          // Posicionar um pouco mais para dentro para não sair da roleta
          const radius = size * 0.42
          const x = Math.cos(radians) * radius + size / 2
          const y = Math.sin(radians) * radius + size / 2

          return (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={size > 500 ? "10" : size > 400 ? "9" : "8"}
              fontWeight="bold"
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,1)',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.9))'
              }}
            >
              {typeof item === 'object' ? (item.value || item.numero || item.label) : String(item)}
            </text>
          )
        })}
      </svg>

      {/* Ponteiro */}
      {showPointer && (
        <div
          style={{
            position: 'absolute',
            top: size > 500 ? 20 : size > 400 ? 15 : 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: size > 500 ? '15px solid transparent' : size > 400 ? '12px solid transparent' : '10px solid transparent',
            borderRight: size > 500 ? '15px solid transparent' : size > 400 ? '12px solid transparent' : '10px solid transparent',
            borderTop: size > 500 ? '30px solid #ff4757' : size > 400 ? '25px solid #ff4757' : '20px solid #ff4757',
            zIndex: 10,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        />
      )}
    </div>
  )
}

// Função auxiliar para clarear cor
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

export default Roulette
