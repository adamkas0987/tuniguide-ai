// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRewardsPoints } from '../services/api.js'

const LEVEL_COLORS = {
  'Débutant': { color: '#6b7280', bg: '#f3f4f6', icon: '🌱' },
  'Bronze':   { color: '#92400e', bg: '#fef3c7', icon: '🥉' },
  'Argent':   { color: '#374151', bg: '#f3f4f6', icon: '🥈' },
  'Or':       { color: '#b45309', bg: '#fef3c7', icon: '🥇' },
}

export default function Profile() {
  const navigate  = useNavigate()
  const { user, token, logout } = useAuth()
  const [rewards, setRewards]   = useState(null)
  const [avatar, setAvatar]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const fileRef = useRef()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    // Charger avatar depuis localStorage
    const saved = localStorage.getItem(`avatar_${user.email}`)
    if (saved) setAvatar(saved)

    if (token) {
      getRewardsPoints(token)
        .then(res => setRewards(res.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user, token])

  const handleAvatarChange = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const data = ev.target.result
      setAvatar(data)
      localStorage.setItem(`avatar_${user.email}`, data)
    }
    reader.readAsDataURL(file)
  }

  const levelInfo = LEVEL_COLORS[rewards?.level] || LEVEL_COLORS['Débutant']

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#6b7280' }}>
      ⏳ Chargement...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1D9E75,#0a2342)', padding: '40px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <div onClick={() => fileRef.current.click()} style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: avatar ? 'transparent' : '#1D9E75',
            border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', margin: '0 auto'
          }}>
            {avatar ? (
              <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px', color: 'white', fontWeight: '600' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div onClick={() => fileRef.current.click()} style={{
            position: 'absolute', bottom: '0', right: '0',
            width: '24px', height: '24px', borderRadius: '50%',
            background: '#4ade80', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '12px'
          }}>📷</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
        </div>

        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '500', margin: '0 0 4px' }}>
          {user?.name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 12px' }}>
          {user?.email}
        </p>

        {/* Badge niveau */}
        {rewards && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 14px' }}>
            <span style={{ fontSize: '16px' }}>{levelInfo.icon}</span>
            <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
              Niveau {rewards.level} • {rewards.points} pts
            </span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 24px' }}>

        {/* Stats */}
        {rewards && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { icon: '🗺️', value: rewards.trips_count, label: 'Voyages' },
              { icon: '💬', value: rewards.reviews_count, label: 'Avis' },
              { icon: '🏆', value: rewards.points, label: 'Points' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: '600', color: '#1D9E75' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progression niveau */}
        {rewards?.next_level && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginBottom: '8px', fontWeight: '500' }}>
              <span>{levelInfo.icon} Niveau {rewards.level}</span>
              <span>→ {rewards.next_level} ({rewards.next_points} pts restants)</span>
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (rewards.points / (rewards.points + rewards.next_points)) * 100)}%`,
                background: 'linear-gradient(90deg,#1D9E75,#4ade80)',
                borderRadius: '10px',
                transition: 'width 1s ease'
              }} />
            </div>
          </div>
        )}

        {/* Menu actions */}
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          {[
            { icon: '🗺️', label: 'Mes voyages', desc: `${rewards?.trips_count || 0} voyage(s) planifié(s)`, path: '/history', color: '#1D9E75' },
            { icon: '🏆', label: 'Mes récompenses', desc: `${rewards?.points || 0} points • Niveau ${rewards?.level || 'Débutant'}`, path: '/rewards', color: '#f59e0b' },
            { icon: '🔍', label: 'Rechercher des lieux', desc: 'Explorer toute la Tunisie', path: '/search', color: '#2563eb' },
            { icon: '📊', label: 'Dashboard Analytics', desc: 'Statistiques et données', path: '/dashboard', color: '#7c3aed' },
          ].map((item, i) => (
            <div key={i} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 20px', cursor: 'pointer',
              borderBottom: i < 3 ? '0.5px solid #f3f4f6' : 'none',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.desc}</div>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '16px' }}>›</span>
            </div>
          ))}
        </div>

        {/* Infos compte */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '14px' }}>
            👤 Informations du compte
          </h3>
          {[
            { label: 'Nom complet', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Membre depuis', value: '2026' },
          ].map((info, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '0.5px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{info.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{info.value}</span>
            </div>
          ))}
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/')} style={{ flex: 1, background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
            ← Accueil
          </button>
          <button onClick={() => { logout(); navigate('/') }} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
            🚪 Déconnexion
          </button>
        </div>

      </div>
    </div>
  )
}