import { createContext, useContext } from 'react'
import { useNotification } from '../hooks/useNotification.js'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const notificationHook = useNotification()
  
  return (
    <NotificationContext.Provider value={notificationHook}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
