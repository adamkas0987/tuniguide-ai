// src/pages/Destination.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDestination } from '../services/api.js'
import PlaceImage from '../components/PlaceImage'
import RatingStars from '../components/RatingStars'

export default function Destination() {
  const { city } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('places')

  useEffect(() => {
    getDestination(city)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [city])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#6b7280' }}>
      ⏳ Chargement de {city}...
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <p style={{ color: '#6b7280' }}>Destination non trouvée</p>
        <button onClick={() => navigate('/')} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', marginTop: '12px' }}>
          Retour
        </button>
      </div>
    </div>
  )

  const CITY_EMOJIS = { Tunis: '🕌', Sousse: '🏖️', Djerba: '🌊', Kairouan: '🕍', Sfax: '🏺', 'El Jem': '🏛️' }
  const CITY_COLORS = {
    Tunis: 'linear-gradient(135deg,#0a2342,#1a4a7a)',
    Sousse: 'linear-gradient(135deg,#0f6e56,#1a4a7a)',
    Djerba: 'linear-gradient(135deg,#023e8a,#0077b6)',
    Kairouan: 'linear-gradient(135deg,#4a1800,#7b2d00)',
    Sfax: 'linear-gradient(135deg,#1a3a1a,#2d5a2d)',
    'El Jem': 'linear-gradient(135deg,#5c2e0b,#8B4513)',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', paddingBottom: '40px' }}>

      {/* Hero */}
      <div style={{ background: CITY_COLORS[city] || 'linear-gradient(135deg,#1D9E75,#0a2342)', padding: '48px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: '64px', marginBottom: '12px' }}>{CITY_EMOJIS[city] || '🗺️'}</div>
        <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '500', margin: '0 0 8px' }}>{city}</h1>
        {data.weather && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 16px', color: 'white', fontSize: '13px', marginBottom: '16px' }}>
            {data.weather.is_sunny ? '☀️' : '🌤️'} {data.weather.temperature}°C — {data.weather.description}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
          {[
            { val: data.places?.length || 0, label: 'Lieux' },
            { val: data.restaurants?.length || 0, label: 'Restaurants' },
            { val: data.hotels?.length || 0, label: 'Hôtels' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#4ade80' }}>{s.val}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>

        {/* Bouton planifier */}
        <button onClick={() => navigate(`/?city=${city}`)} style={{ width: '100%', background: '#1D9E75', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 4px 15px rgba(29,158,117,0.3)' }}>
          🚀 Planifier mon voyage à {city}
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '4px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {[['places', '🗺️', 'Lieux'], ['restaurants', '🍽️', 'Restaurants'], ['hotels', '🏨', 'Hôtels']].map(([key, icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, background: activeTab === key ? '#1D9E75' : 'transparent', color: activeTab === key ? 'white' : '#6b7280', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}>
              {icon} {label}
            </button>
          ))}
        </div>

       {/* Lieux */}
{activeTab === 'places' && (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
    {(data.places || []).map((place, i) => (
      <div key={i} style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '0.5px solid #e5e7eb' }}>
        <PlaceImage
          name={place.name}
          type={place.type}
          style={{ width: '100%', height: '140px' }}
        />
        <div style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0, flex: 1, paddingRight: '8px' }}>{place.name}</h3>
            <span style={{ background: '#f0fdf4', color: '#1D9E75', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: '500' }}>
              {place.price === 0 ? '✨ Gratuit' : `${place.price} DT`}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5', marginBottom: '10px' }}>
            {(place.description || '').slice(0, 100)}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '11px', padding: '3px 8px', borderRadius: '20px' }}>🎯 {place.type}</span>
            <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '11px', padding: '3px 8px', borderRadius: '20px' }}>⏱️ {place.duration}h</span>
          </div>
          <RatingStars
            placeName={place.name}
            city={data.city}
            initialRating={place.rating}
            initialCount={place.ratings_count || 0}
          />
        </div>
      </div>
    ))}
  </div>
)}

        {/* Restaurants */}
        {activeTab === 'restaurants' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {(data.restaurants || []).map((r, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '0.5px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🍽️</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{r.cuisine}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' }}>💰 {r.price_per_person} DT/pers</span>
                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' }}>⭐ {r.rating}/5</span>
                </div>
                <button onClick={() => navigate(`/booking/restaurant/${encodeURIComponent(r.name)}/${city}/${r.price_per_person}`)} style={{ width: '100%', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                  🍽️ Réserver une table
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hôtels */}
        {activeTab === 'hotels' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {(data.hotels || []).map((h, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '0.5px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🏨</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>{h.name}</div>
                    <div style={{ fontSize: '12px', color: '#f59e0b' }}>{'⭐'.repeat(h.stars || 3)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ background: '#eff6ff', color: '#1e40af', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' }}>💰 {h.price_per_night} DT/nuit</span>
                  <span style={{ background: '#eff6ff', color: '#1e40af', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' }}>⭐ {h.rating}/5</span>
                </div>
                <button onClick={() => navigate(`/booking/hotel/${encodeURIComponent(h.name)}/${city}/${h.price_per_night}`)} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                  🏨 Réserver cet hôtel
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate('/')} style={{ width: '100%', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', cursor: 'pointer', marginTop: '20px' }}>
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}