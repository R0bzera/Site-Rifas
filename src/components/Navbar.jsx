import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { authService } from '../services/authService.js'

function Navbar() {
  const navigate = useNavigate()
  const isAuthed = authService.isAuthenticated()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    async function checkAdmin() {
      if (isAuthed) {
        const adminStatus = await authService.isAdmin()
        setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [isAuthed])

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    function onEsc(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (error) {
      localStorage.removeItem('sr_auth_v1')
      navigate('/login')
    }
  }

  const handleNavigation = (path) => {
    try {
      setOpen(false)
      navigate(path)
    } catch (error) {
      setTimeout(() => {
        try {
          navigate(path)
        } catch (retryError) {
          window.location.href = path
        }
      }, 100)
    }
  }

  return (
    <nav className="nav" ref={ref}>
      <div className="nav-inner">
        <button aria-label="menu" className="btn btn-ghost" onClick={() => setOpen(v => !v)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="brand">SkinRifas</div>
        <div className="spacer" />
        {!isAuthed ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Entrar</button>
            <button className="btn" onClick={() => navigate('/criar-conta')}>Criar conta</button>
          </div>
        ) : (
          <button className="btn" onClick={handleLogout}>Sair</button>
        )}
      </div>
      {open && (
        <div className="menu-panel card">
          <nav className="menu-list">
            <button onClick={() => handleNavigation('/rifas')} className="menu-item-button">
              <span className="menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0-2 2 2 2 0 1 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V7z" stroke="currentColor" strokeWidth="2"/></svg>
                Rifas
              </span>
            </button>
            <button onClick={() => handleNavigation('/rifas-sorteadas')} className="menu-item-button">
              <span className="menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0V4ZM4 6h3v2a3 3 0 0 1-3-3v1ZM20 6h-3v2a3 3 0 0 0 3-3v1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Sorteadas
              </span>
            </button>
            {isAuthed && (
              <>
                <button onClick={() => handleNavigation('/minhas-compras')} className="menu-item-button">
                  <span className="menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Zm3 0a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="2"/></svg>
                    Minhas compras
                  </span>
                </button>
                {isAdmin && (
                  <button onClick={() => handleNavigation('/admin/rifas')} className="menu-item-button">
                    <span className="menu-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm4-3h8v3H8V4Z" stroke="currentColor" strokeWidth="2"/></svg>
                      Admin: Rifas
                    </span>
                  </button>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </nav>
  )
}

export default Navbar


