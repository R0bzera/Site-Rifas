import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authService } from '../services/authService.js'

function ProtectedRoute() {
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const location = useLocation()

  useEffect(() => {
    async function validateAuth() {
      if (!authService.isAuthenticated()) {
        setIsValid(false)
        setIsValidating(false)
        return
      }

      try {
        const user = await authService.validateToken()
        setIsValid(!!user)
      } catch (error) {
        setIsValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateAuth()
  }, [location.pathname])

  if (isValidating) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Validando sessão...</div>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return <Navigate to="/login" state={{ 
      from: location,
      redirectAfterAuth: location.pathname + location.search,
      message: 'Faça login para acessar esta página'
    }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
