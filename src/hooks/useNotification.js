import { useState, useCallback } from 'react'

export function useNotification() {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const notification = { id, message, type, duration }
    
    setNotifications(prev => [...prev, notification])
    
    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const showSuccess = useCallback((message, duration = 5000) => {
    return addNotification(message, 'success', duration)
  }, [addNotification])

  const showError = useCallback((message, duration = 7000) => {
    return addNotification(message, 'error', duration)
  }, [addNotification])

  const showWarning = useCallback((message, duration = 6000) => {
    return addNotification(message, 'warning', duration)
  }, [addNotification])

  const showInfo = useCallback((message, duration = 5000) => {
    return addNotification(message, 'info', duration)
  }, [addNotification])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  }
}
