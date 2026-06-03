// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateTrip, getCities, getWeather } from '../services/api'

const TUNISIA_FACTS = [
  "🏛️ Tunis abrite la médina la plus ancienne d'Afrique du Nord",
  "🌊 Djerba est l'île la plus grande de la Méditerranée",
  "🏺 El Jem possède le 3ème plus grand amphithéâtre romain du monde",
  "🕌 Kairouan est la 4ème ville sainte de l'Islam",
  "🌅 La Tunisie compte plus de 1300 km de côtes méditerranéennes",
  "🌿 Le Sahara tunisien représente 40% du territoire national",
]

const BG_IMAGES = [
  { city: "Sidi Bou Said", color: "#1a6b9a", emoji: "🏘️" },
  { city: "Médina de Tunis", color: "#2d6a4f", emoji: "🕌" },
  { city: "Amphithéâtre El Jem", color: "#8B4513", emoji: "🏛️" },
  { city: "Plage de Djerba", color: "#0077b6", emoji: "🏖️" },
  { city: "Désert du Sahara", color: "#c77d2a", emoji: "🌵" },
]

function Home({ setTripData }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ city: '', budget: 300, days: 3, type: 'culture' })
  const [cities, setCities] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [factIndex, setFactIndex] = useState(0)
  const [bgIndex, setBgIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    getCities().then(res => setCities(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setFactIndex(i => (i + 1) % TUNISIA_FACTS.length)
        setBgIndex(i => (i + 1) % BG_IMAGES.length)
        setVisible(true)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (formData.city) {
      getWeather(formData.city).then(res => setWeather(res.data)).catch(() => setWeather(null))
    }
  }, [formData.city])

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await generateTrip(formData)
      setTripData(res.data)
      navigate('/result')
    } catch {
      setError("Erreur — vérifiez que le backend est actif.")
    } finally {
      setLoading(false)
    }
  }

  const bg = BG_IMAGES[bgIndex]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>

      {/* ── HERO ─────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${bg.color}ee, #1a1a2eee)`,
        padding: '80px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 1s ease'
      }}>

        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        {/* Emoji animé */}
        <div style={{
          fontSize: '72px', marginBottom: '16px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.5s ease'
        }}>
          {bg.emoji}
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 'bold', color: 'white', margin: '0 0 8px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          TuniGuide <span style={{ color: '#4ade80' }}>AI</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', margin: '0 0 16px' }}>
          Votre assistant intelligent pour explorer la Tunisie
        </p>

        {/* Ville animée */}
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '8px 20px',
          borderRadius: '30px',
          color: 'white',
          fontSize: '15px',
          marginBottom: '24px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s ease'
        }}>
          📍 {bg.city}
        </div>

        {/* Fait sur la Tunisie */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'rgba(255,255,255,0.12)',
          padding: '12px 20px',
          borderRadius: '12px',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '14px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}>
          {TUNISIA_FACTS[factIndex]}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '32px', flexWrap: 'wrap' }}>
          {[
            { value: '6', label: 'Villes', icon: '🏙️' },
            { value: '96+', label: 'Lieux', icon: '🗺️' },
            { value: '24/7', label: 'Agent IA', icon: '🤖' },
            { value: '100%', label: 'Gratuit', icon: '✅' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '24px' }}>{s.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80' }}>{s.value}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORMULAIRE ───────────────────────────── */}
      <div style={{ maxWidth: '680px', margin: '-30px auto 0', padding: '0 24px 60px', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.8)'
        }}>

          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 24px', textAlign: 'center' }}>
            🚀 Planifier mon voyage
          </h2>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Ville */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                🏙️ Ville de destination
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                style={{
                  width: '100%', border: '2px solid #e5e7eb', borderRadius: '12px',
                  padding: '12px 16px', fontSize: '14px', outline: 'none',
                  backgroundColor: '#fafafa', cursor: 'pointer', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#16a34a'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Choisir une ville...</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Météo */}
              {weather && (
                <div style={{
                  marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: '#eff6ff', padding: '10px 14px', borderRadius: '10px',
                  fontSize: '13px', color: '#1d4ed8', border: '1px solid #bfdbfe'
                }}>
                  <span style={{ fontSize: '20px' }}>
                    {weather.is_sunny ? '☀️' : '🌤️'}
                  </span>
                  <span><strong>{weather.temperature}°C</strong> — {weather.description}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#3b82f6' }}>
                    {weather.advice?.slice(0, 40)}...
                  </span>
                </div>
              )}
            </div>

            {/* Budget */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                💰 Budget total :
                <span style={{ color: '#16a34a', fontSize: '16px', fontWeight: 'bold', marginLeft: '8px' }}>
                  {formData.budget} DT
                </span>
              </label>
              <input type="range" name="budget" min="100" max="2000" step="50"
                value={formData.budget} onChange={handleChange}
                style={{ width: '100%', accentColor: '#16a34a', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                <span>100 DT</span><span>2000 DT</span>
              </div>
            </div>

            {/* Durée */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                📅 Durée :
                <span style={{ color: '#16a34a', fontSize: '16px', fontWeight: 'bold', marginLeft: '8px' }}>
                  {formData.days} jour{formData.days > 1 ? 's' : ''}
                </span>
              </label>
              <input type="range" name="days" min="1" max="10" step="1"
                value={formData.days} onChange={handleChange}
                style={{ width: '100%', accentColor: '#16a34a', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                <span>1 jour</span><span>10 jours</span>
              </div>
            </div>

            {/* Type de voyage */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                🎯 Type de voyage
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { value: 'culture',   label: '🏛️ Culture',   desc: 'Médinas, musées, histoire', color: '#7c3aed' },
                  { value: 'beach',     label: '🏖️ Plage',     desc: 'Mer, soleil, détente', color: '#0284c7' },
                  { value: 'relax',     label: '🌿 Relax',     desc: 'Promenade, café, nature', color: '#059669' },
                  { value: 'adventure', label: '🏕️ Aventure',  desc: 'Sport, désert, découverte', color: '#d97706' },
                ].map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.value })}
                    style={{
                      padding: '14px 12px',
                      borderRadius: '12px',
                      border: `2px solid ${formData.type === t.value ? t.color : '#e5e7eb'}`,
                      backgroundColor: formData.type === t.value ? t.color + '15' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px', color: formData.type === t.value ? t.color : '#374151' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || !formData.city}
              style={{
                width: '100%',
                background: loading || !formData.city
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #16a34a, #15803d)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading || !formData.city ? 'not-allowed' : 'pointer',
                boxShadow: loading || !formData.city ? 'none' : '0 4px 15px rgba(22,163,74,0.4)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? '⏳ Génération en cours...' : '🚀 Générer mon itinéraire IA'}
            </button>

          </form>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
          {[
            { icon: '🤖', title: 'Agent IA', desc: 'Assistance 24h/24' },
            { icon: '🌤️', title: 'Météo Live', desc: 'Temps réel' },
            { icon: '📄', title: 'Export PDF', desc: 'Votre itinéraire' },
          ].map((f, i) => (
            <div key={i} style={{
              backgroundColor: 'white', borderRadius: '14px', padding: '16px',
              textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{f.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{f.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Home