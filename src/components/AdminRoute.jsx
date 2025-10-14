import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authService } from '../services/authService.js'

function AdminRoute() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState(null)
  const location = useLocation()

  useEffect(() => {
    async function checkAdmin() {
      try {
        if (!authService.isAuthenticated()) {
          setIsAdmin(false)
          setLoading(false)
          return
        }

        const adminStatus = await authService.isAdmin()
        setIsAdmin(adminStatus)
        setError(null)
      } catch (error) {
        setIsAdmin(false)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Verificando permissões...</div>
        </div>
      </div>
    )
  }

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <h2>Erro de Autenticação</h2>
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
          <button 
            className="btn" 
            onClick={() => {
              authService.logout()
              window.location.href = '/login'
            }}
            style={{ marginTop: 16 }}
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <p style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>
            Apenas administradores podem acessar esta área.
          </p>
          <button 
            className="btn" 
            onClick={() => window.history.back()}
            style={{ marginTop: 16 }}
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default AdminRoute

