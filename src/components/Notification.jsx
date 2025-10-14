import { useState, useEffect } from 'react'

function Notification({ message, type = 'info', duration = 5000, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onClose?.(), 300) // Aguarda animação de saída
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  if (!visible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
    }
  }

  const getStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '400px',
      transform: visible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      cursor: 'pointer'
    }

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        }
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        }
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7'
        }
      default:
        return {
          ...baseStyles,
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb'
        }
    }
  }

  return (
    <div style={getStyles()} onClick={handleClose}>
      {getIcon()}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

export default Notification
