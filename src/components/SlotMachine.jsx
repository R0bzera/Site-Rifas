import React, { useState, useEffect, useRef } from 'react'

function SlotMachine({ 
  items = [], 
  isSpinning = false, 
  onSpinComplete = () => {}, 
  duration = 5000,
  size = 300,
  numeroSorteadoBackend = null
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const slotRef = useRef(null)

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      startSpin()
    }
  }, [isSpinning])

  const startSpin = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    const itemSorteado = items.find(item => item.value === numeroSorteadoBackend) || items[0]
    setSelectedItem(itemSorteado)
    
    const slotElement = slotRef.current
    if (slotElement) {
      slotElement.style.transition = 'none'
      slotElement.style.transform = 'translateY(0px)'
      
      slotElement.offsetHeight
      
      const itemHeight = size / 3
      const totalItems = items.length
      const extraRotations = items.length * 2
      const finalPosition = -((itemSorteado.value - 2) * itemHeight + extraRotations * itemHeight)
      slotElement.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      slotElement.style.transform = `translateY(${finalPosition}px)`
      
      setTimeout(() => {
        setIsAnimating(false)
        setTimeout(() => {
          onSpinComplete(itemSorteado)
        }, 1000)
      }, duration)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      padding: 30,
      borderRadius: 20,
      border: '4px solid #ffd700',
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(0,0,0,0.3)',
      position: 'relative',
      minHeight: size + 100
    }}>
      <div
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(145deg, #000000, #1a1a1a)',
          borderRadius: 15,
          border: '3px solid #333',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(255, 215, 0, 0.3)'
        }}
      >
        <div
          ref={slotRef}
          style={{
            position: 'relative',
            height: '100%',
            transform: 'translateY(0px)'
          }}
        >
          {/* Renderizar números com loop infinito */}
          {Array.from({ length: items.length * 3 }, (_, i) => {
            const itemIndex = i % items.length
            const item = items[itemIndex]
            const isCenter = i === Math.floor(items.length / 2)
            
            return (
              <div
                key={i}
                style={{
                  height: size / 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCenter 
                    ? 'linear-gradient(145deg, #2a2a2a, #1a1a1a)' 
                    : 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                  borderBottom: '1px solid #333',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontFamily: 'Orbitron, Arial, sans-serif',
                  fontSize: size > 400 ? 64 : size > 300 ? 56 : 48,
                  fontWeight: '900',
                  color: isCenter ? '#ffd700' : '#ffffff',
                  textShadow: isCenter 
                    ? '0 0 20px #ffd700, 0 0 40px #ffd700, 2px 2px 4px rgba(0,0,0,0.8)'
                    : '2px 2px 4px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}>
                  {typeof item === 'object' ? (item.value || item.numero || item.label) : String(item)}
                </div>
                
                {isCenter && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
                    animation: 'shine 2s infinite'
                  }} />
                )}
              </div>
            )
          })}
        </div>
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: size / 3,
          transform: 'translateY(-50%)',
          border: '4px solid #ffd700',
          borderRadius: 8,
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 10px rgba(255, 215, 0, 0.3)',
          pointerEvents: 'none',
          zIndex: 10,
          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)'
        }} />
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 215, 0, 0.03) 2px, rgba(255, 215, 0, 0.03) 4px)',
          pointerEvents: 'none',
          zIndex: 5
        }} />
      </div>
      
      <div style={{
        position: 'absolute',
        top: -15,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 32,
        color: '#ffd700',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
      }}>
        🎰
      </div>
      
      <div style={{
        position: 'absolute',
        left: -20,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 10,
        height: 60,
        background: 'linear-gradient(180deg, #ff0000, #ff6600, #ffaa00)',
        borderRadius: 5,
        boxShadow: '0 0 15px rgba(255, 0, 0, 0.8)',
        animation: 'blink 1s infinite alternate'
      }} />
      
      <div style={{
        position: 'absolute',
        right: -20,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 10,
        height: 60,
        background: 'linear-gradient(180deg, #00ff00, #00aa00, #006600)',
        borderRadius: 5,
        boxShadow: '0 0 15px rgba(0, 255, 0, 0.8)',
        animation: 'blink 1.2s infinite alternate'
      }} />
      
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes blink {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default SlotMachine
