// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{ fontSize: '24px' }}>🗺️</span>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>TuniGuide</span>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>AI</span>
      </Link>

      {/* Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          Accueil
        </Link>
        <Link to="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          Dashboard
        </Link>

        {user ? (
          <>
            <Link to="/history" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Mes voyages
            </Link>
            <span style={{ color: '#16a34a', fontSize: '14px', fontWeight: '600' }}>
              👤 {user.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Connexion
            </Link>
            <Link to="/register" style={{
              backgroundColor: '#16a34a',
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              S'inscrire
            </Link>
          </>
        )}
      </div>

    </nav>
  )
}

export default Navbar