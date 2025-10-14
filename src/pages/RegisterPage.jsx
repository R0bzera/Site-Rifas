import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService.js'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function onlyDigits(value) { return value.replace(/\D/g, '') }
function maskPhone(value) {
  const v = onlyDigits(value).slice(0, 11)
  if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

function RegisterPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotificationContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Dados de redirecionamento vindos de outras páginas
  const { redirectAfterAuth, redirectData, message } = location.state || {}

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Validação de confirmação de senha
      if (password !== confirmPassword) {
        setError('As senhas não coincidem')
        return
      }
      
      const res = await authService.register({ 
        name, 
        email, 
        phone: onlyDigits(phone), 
        password 
      })
      
      if (!res.ok) { 
        setError(res.message)
        showError(res.message)
        return 
      }
      
      // Mostrar mensagem de sucesso
      showSuccess('Conta criada com sucesso! Você pode fazer login agora.')
      
      // Se há um redirecionamento configurado, ir para lá
      if (redirectAfterAuth) {
        navigate(redirectAfterAuth, { state: redirectData })
      } else {
        // Caso contrário, ir para login normalmente
        navigate('/login')
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao criar conta. Tente novamente.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <h2 className="page-title">Criar conta</h2>
        
        {/* Mensagem informativa quando vem de uma compra */}
        {message && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {message}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>Nome completo</label>
            <input 
              className="input" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Seu nome completo" 
              required 
            />
          </div>
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
            <label>Celular</label>
            <input 
              className="input" 
              inputMode="numeric" 
              value={phone} 
              onChange={(e) => setPhone(maskPhone(e.target.value))} 
              placeholder="(11) 90000-0000" 
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
              placeholder="Mínimo 6 caracteres" 
              required 
            />
          </div>
          <div className="form-row">
            <label>Confirmar senha</label>
            <input 
              className="input" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              minLength={6} 
              placeholder="Digite a senha novamente" 
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
              {loading ? 'Criando conta...' : 'Criar conta'}
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
            Já tem uma conta?
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/login', { state: location.state })}
            style={{ fontSize: 14 }}
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage


