import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccess, showError } = useNotificationContext()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const success = await authService.login({ email, password })
      if (!success.ok) {
        setError(success.message)
        showError(success.message)
        return
      }
      
      showSuccess('Login realizado com sucesso!')
      
      const from = location.state?.from?.pathname || '/rifas'
      const redirectAfterAuth = location.state?.redirectAfterAuth
      const redirectData = location.state?.redirectData
      
      if (redirectAfterAuth) {
        navigate(redirectAfterAuth, { state: redirectData, replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao fazer login. Tente novamente.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <h2 className="page-title">Entrar</h2>
        
        {location.state?.message && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            color: '#3b82f6',
            fontSize: 14
          }}>
            {location.state.message}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input 
              className="input" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com" 
              required 
            />
          </div>
          <div className="form-row">
            <label>Senha</label>
            <input 
              className="input" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              minLength={6} 
              placeholder="Sua senha" 
              required 
            />
          </div>
          {error && <div className="error">{error}</div>}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: 20,
          paddingTop: 20,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 12 }}>
            Não tem uma conta?
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/criar-conta', { state: location.state })}
            style={{ fontSize: 14 }}
          >
            Criar conta agora
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage


