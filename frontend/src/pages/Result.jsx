// src/pages/Result.jsx
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MapComponent from '../components/MapComponent'
import ChatWidget from '../components/ChatWidget'
import ExportPDF from '../components/ExportPDF'
import { useAuth } from '../context/AuthContext'
import { generateTrip } from '../services/api.js'

function Result({ tripData: initialTripData }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeDay, setActiveDay] = useState(1)
  const { user, saveTrip } = useAuth()
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tripData, setTripData] = useState(initialTripData || null)
  const [loadingShared, setLoadingShared] = useState(false)
  const [sharedError, setSharedError] = useState(false)

  const isSharedView = searchParams.get('shared') === 'true'

  // ── Load shared trip from URL params ─────────────────────────
  useEffect(() => {
    if (isSharedView && !initialTripData) {
      const lsKey = searchParams.get('key')
      const city = searchParams.get('city')
      const days = searchParams.get('days')
      const budget = searchParams.get('budget')
      const travel_type = searchParams.get('type') || 'culture'

      // Try localStorage first (same browser — instant, no API call)
      if (lsKey) {
        try {
          const cached = localStorage.getItem(lsKey)
          if (cached) {
            setTripData(JSON.parse(cached))
            return
          }
        } catch (e) {}
      }

      // Fallback: regenerate from backend (different device)
      if (city && days && budget) {
        setLoadingShared(true)
        generateTrip({ city, days: parseInt(days), budget: parseInt(budget), travel_type })
          .then(res => {
            setTripData(res.data)
            setLoadingShared(false)
          })
          .catch(() => {
            setSharedError(true)
            setLoadingShared(false)
          })
      }
    }
  }, [isSharedView])

  // ── Auto-save trip for logged-in users ───────────────────────
  useEffect(() => {
    if (tripData && user && !saved && !isSharedView) {
      saveTrip(tripData).then(() => setSaved(true)).catch(() => {})
    }
  }, [tripData, user])

  // ── Share: copy link to clipboard ────────────────────────────
  const handleShare = () => {
    if (!tripData) return
    // Save full trip data to localStorage so shared link works instantly
    const lsKey = `tuniguide_trip_${tripData.city}_${tripData.days}_${tripData.budget}`
    localStorage.setItem(lsKey, JSON.stringify(tripData))
    const params = new URLSearchParams({
      shared: 'true',
      city: tripData.city || '',
      days: tripData.days || '',
      budget: tripData.budget || '',
      type: tripData.travel_type || 'culture',
      key: lsKey,
    })
    const url = `${window.location.origin}/result?${params.toString()}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  // ── Share: open WhatsApp ──────────────────────────────────────
  const handleWhatsApp = () => {
    if (!tripData) return
    const { city, days, budget, travel_type } = tripData
    const lsKey = `tuniguide_trip_${city}_${days}_${budget}`
    localStorage.setItem(lsKey, JSON.stringify(tripData))
    const params = new URLSearchParams({
      shared: 'true',
      city: city || '',
      days: days || '',
      budget: budget || '',
      type: travel_type || 'culture',
      key: lsKey,
    })
    const url = `${window.location.origin}/result?${params.toString()}`
    const message =
      `🇹🇳 Découvre mon itinéraire en Tunisie !\n` +
      `📍 Ville : ${city}\n` +
      `📅 Durée : ${days} jour${days > 1 ? 's' : ''}\n` +
      `💰 Budget : ${budget} DT\n` +
      `🎯 Type : ${travel_type}\n` +
      `🔗 ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  // ── Loading state for shared view ────────────────────────────
  if (loadingShared) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', gap: '16px'
      }}>
        <div style={{ fontSize: '64px', animation: 'spin 2s linear infinite' }}>🗺️</div>
        <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500' }}>
          Chargement de l'itinéraire partagé…
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Error state for shared view ──────────────────────────────
  if (sharedError) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', gap: '16px'
      }}>
        <div style={{ fontSize: '64px' }}>😕</div>
        <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500' }}>
          Impossible de charger cet itinéraire partagé.
        </p>
        <button onClick={() => navigate('/')} style={{
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          color: 'white', border: 'none', borderRadius: '14px',
          padding: '14px 28px', fontSize: '15px', fontWeight: 'bold',
          cursor: 'pointer', boxShadow: '0 4px 15px rgba(22,163,74,0.4)'
        }}>
          🚀 Créer mon propre voyage
        </button>
      </div>
    )
  }

  // ── No trip data ─────────────────────────────────────────────
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

  const { city, days, travel_type, budget, itinerary, recommended_hotel, cost_summary, weather } = tripData

  const typeColors = {
    culture: '#7c3aed', beach: '#0284c7', relax: '#059669', adventure: '#d97706'
  }
  const accentColor = typeColors[travel_type] || '#16a34a'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', paddingBottom: '100px' }}>

      {/* ── SHARED VIEW BANNER ───────────────────────────────── */}
      {isSharedView && (
        <div style={{
          backgroundColor: '#fef3c7',
          borderBottom: '2px solid #f59e0b',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          color: '#92400e',
          fontWeight: '500',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '20px' }}>👁️</span>
          <span>
            Vous consultez un itinéraire partagé — <strong>{city}, {days} jour{days > 1 ? 's' : ''}, {budget} DT</strong>
          </span>
          <button
            onClick={() => navigate('/')}
            style={{
              marginLeft: 'auto',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🚀 Créer le mien
          </button>
        </div>
      )}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Row 1 — Share buttons (hidden in shared view) */}
          {!isSharedView && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

              {/* Copy link */}
              <button
                onClick={handleShare}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px 20px',
                  backgroundColor: copied ? '#16a34a' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: copied
                    ? '0 4px 15px rgba(22,163,74,0.4)'
                    : '0 4px 15px rgba(59,130,246,0.4)',
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <span style={{ fontSize: '16px' }}>{copied ? '✅' : '🔗'}</span>
                {copied ? 'Lien copié !' : 'Copier le lien'}
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px 20px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Partager sur WhatsApp
              </button>

            </div>
          )}

          {/* Row 2 — PDF + Nouveau voyage */}
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

      </div>

      <ChatWidget tripData={tripData} />
    </div>
  )
}

export default Result
