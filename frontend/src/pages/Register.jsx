// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirm) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      await register(formData.name, formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🗺️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            TuniGuide AI
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px' }}>
            Créer votre compte gratuitement
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>

          {[
            { name: 'name',     label: 'Nom complet',      type: 'text',     placeholder: 'Adam Kassis' },
            { name: 'email',    label: 'Email',             type: 'email',    placeholder: 'adam@gmail.com' },
            { name: 'password', label: 'Mot de passe',      type: 'password', placeholder: '••••••••' },
            { name: 'confirm',  label: 'Confirmer le mot de passe', type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name} style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                placeholder={field.placeholder}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#d1d5db' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? '⏳ Création...' : '✅ Créer mon compte'}
          </button>

        </form>

        {/* Lien login */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#16a34a', fontWeight: '600', textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register