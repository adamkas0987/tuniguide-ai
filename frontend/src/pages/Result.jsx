// src/pages/Result.jsx
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MapComponent from '../components/MapComponent'
import ChatWidget from '../components/ChatWidget'
import ExportPDF from '../components/ExportPDF'
import { useAuth } from '../context/AuthContext'

function Result({ tripData }) {
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(1)
  const { user, saveTrip } = useAuth()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (tripData && user && !saved) {
      saveTrip(tripData).then(() => setSaved(true)).catch(() => {})
    }
  }, [tripData, user])

  if (!tripData) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🗺️</div>
        <p style={{ color: '#6b7280', fontSize: '20px', marginBottom: '20px', fontWeight: '500' }}>
          Aucun voyage généré.
        </p>
        <button onClick={() => navigate('/')} style={{
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          color: 'white', border: 'none', borderRadius: '14px',
          padding: '14px 28px', fontSize: '15px', fontWeight: 'bold',
          cursor: 'pointer', boxShadow: '0 4px 15px rgba(22,163,74,0.4)'
        }}>
          🚀 Planifier un voyage
        </button>
      </div>
    )
  }

  const { city, days, travel_type, budget, itinerary, recommended_restaurant, recommended_hotel, cost_summary, weather } = tripData

  const typeColors = {
    culture: '#7c3aed', beach: '#0284c7', relax: '#059669', adventure: '#d97706'
  }
  const accentColor = typeColors[travel_type] || '#16a34a'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', paddingBottom: '100px' }}>

      {/* ── HERO ─────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}dd, #1a1a2eee)`,
        padding: '48px 24px 80px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '48px' }}>🗺️</span>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                Votre voyage à {city}
              </h1>
              {user && saved && (
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: '13px' }}>
                  ✅ Sauvegardé dans votre historique
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { icon: '📅', text: `${days} jour${days > 1 ? 's' : ''}` },
              { icon: '💰', text: `Budget : ${budget} DT` },
              { icon: '🎯', text: travel_type },
              weather ? { icon: weather.is_sunny ? '☀️' : '🌤️', text: `${weather.temperature}°C — ${weather.description}` } : null,
            ].filter(Boolean).map((item, i) => (
              <span key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px', borderRadius: '30px',
                color: 'white', fontSize: '13px', fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '-40px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* ── BUDGET CARDS ─────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Activités', value: cost_summary.activities, color: '#16a34a', icon: '🎯', bg: '#f0fdf4' },
            { label: 'Hôtel', value: cost_summary.hotel, color: '#2563eb', icon: '🏨', bg: '#eff6ff' },
            { label: 'Restaurant', value: cost_summary.restaurant, color: '#ea580c', icon: '🍽️', bg: '#fff7ed' },
            {
              label: 'Restant', value: cost_summary.remaining_budget,
              color: cost_summary.remaining_budget >= 0 ? '#16a34a' : '#dc2626',
              icon: cost_summary.remaining_budget >= 0 ? '✅' : '⚠️',
              bg: cost_summary.remaining_budget >= 0 ? '#f0fdf4' : '#fef2f2'
            },
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: item.bg, borderRadius: '16px',
              padding: '16px', textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: `1px solid ${item.color}22`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: item.color }}>
                {item.value} DT
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* ── ITINERAIRE ───────────────────────── */}
        <div style={{
          backgroundColor: 'white', borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '28px',
          marginBottom: '20px', border: '1px solid #f3f4f6'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
            📋 Itinéraire jour par jour
          </h2>

          {/* Onglets jours */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {itinerary.map(item => (
              <button key={item.day} onClick={() => setActiveDay(item.day)} style={{
                padding: '8px 18px', borderRadius: '30px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                backgroundColor: activeDay === item.day ? accentColor : '#f3f4f6',
                color: activeDay === item.day ? 'white' : '#374151',
                boxShadow: activeDay === item.day ? `0 4px 12px ${accentColor}44` : 'none',
                transition: 'all 0.2s'
              }}>
                Jour {item.day}
              </button>
            ))}
          </div>

          {/* Détail jour */}
          {itinerary.filter(item => item.day === activeDay).map(item => (
            <div key={item.day} style={{
              border: `2px solid ${accentColor}33`,
              borderRadius: '16px', padding: '24px',
              background: `linear-gradient(135deg, ${accentColor}08, white)`
            }}>
              {/* Activité */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {item.activity}
                </h3>
                <span style={{
                  backgroundColor: item.cost === 0 ? '#16a34a' : accentColor,
                  color: 'white', fontSize: '12px', padding: '6px 14px',
                  borderRadius: '20px', fontWeight: '600', whiteSpace: 'nowrap'
                }}>
                  {item.cost === 0 ? '✨ Gratuit' : `${item.cost} DT`}
                </span>
              </div>

              <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                {item.description?.slice(0, 200)}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { icon: '⏱️', text: `${item.duration_hours}h` },
                  { icon: '⭐', text: `${item.rating}/5` },
                  { icon: '🎯', text: item.type },
                ].map((tag, i) => (
                  <span key={i} style={{
                    backgroundColor: '#f3f4f6', padding: '6px 12px',
                    borderRadius: '20px', fontSize: '13px', color: '#374151', fontWeight: '500'
                  }}>
                    {tag.icon} {tag.text}
                  </span>
                ))}
              </div>

              {/* Restaurant du jour */}
              {item.restaurant && (
                <div style={{
                  backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: '12px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🍽️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#92400e', fontSize: '14px' }}>
                      {item.restaurant.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {item.restaurant.cuisine} • {item.restaurant.price_per_person} DT/pers • ⭐ {item.restaurant.rating}/5
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: '#fef3c7', color: '#92400e',
                    padding: '4px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap'
                  }}>
                    🍜 Restaurant du jour
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── HOTEL ────────────────────────────── */}
        {recommended_hotel && (
          <div style={{
            backgroundColor: 'white', borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px',
            marginBottom: '20px', border: '1px solid #bfdbfe'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              🏨 Hôtel recommandé pour tout le séjour
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '26px', flexShrink: 0
              }}>🏨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '16px' }}>
                  {recommended_hotel.name}
                </div>
                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>
                  {'⭐'.repeat(recommended_hotel.stars)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  💰 {recommended_hotel.price_per_night} DT/nuit
                </span>
                <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  ⭐ {recommended_hotel.rating}/5
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── CARTE ────────────────────────────── */}
        <div style={{
          backgroundColor: 'white', borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '28px',
          marginBottom: '20px', border: '1px solid #f3f4f6'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            🗺️ Carte du voyage
          </h2>
          <MapComponent itinerary={itinerary} city={city} />
        </div>

        {/* ── BOUTONS ──────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportPDF tripData={tripData} />
          <button onClick={() => navigate('/')} style={{
            flex: 1, backgroundColor: 'white', color: '#374151',
            border: '2px solid #e5e7eb', borderRadius: '14px',
            padding: '14px 24px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            ← Nouveau voyage
          </button>
        </div>

      </div>

      <ChatWidget tripData={tripData} />
    </div>
  )
}

export default Result