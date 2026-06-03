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

  useEffect(() => {
    if (tripData && user) {
      saveTrip(tripData).catch(err => console.error(err))
    }
  }, [tripData, user])

  if (!tripData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '16px' }}>
          Aucun voyage généré.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Planifier un voyage
        </button>
      </div>
    )
  }

  const {
    city,
    days,
    travel_type,
    budget,
    itinerary,
    recommended_restaurant,
    recommended_hotel,
    cost_summary,
    weather
  } = tripData

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a, #2563eb)',
        color: 'white',
        padding: '40px 24px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
            🗺️ Votre voyage à {city}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
            {[
              `📅 ${days} jour${days > 1 ? 's' : ''}`,
              `💰 Budget : ${budget} DT`,
              `🎯 ${travel_type}`,
              weather ? `🌤️ ${weather.temperature}°C — ${weather.description}` : null
            ].filter(Boolean).map((item, i) => (
              <span key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px'
              }}>
                {item}
              </span>
            ))}
          </div>
          {user && (
            <p style={{ fontSize: '13px', marginTop: '12px', opacity: 0.8 }}>
              ✅ Voyage sauvegardé dans votre historique
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Résumé budget */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'Activités',  value: cost_summary.activities,       color: '#16a34a' },
            { label: 'Hôtel',      value: cost_summary.hotel,            color: '#2563eb' },
            { label: 'Restaurant', value: cost_summary.restaurant,       color: '#f97316' },
            {
              label: 'Restant',
              value: cost_summary.remaining_budget,
              color: cost_summary.remaining_budget >= 0 ? '#16a34a' : '#dc2626',
              bg: cost_summary.remaining_budget >= 0 ? '#f0fdf4' : '#fef2f2'
            },
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: item.bg || 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>
                {item.value} DT
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Itinéraire */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            📋 Itinéraire jour par jour
          </h2>

          {/* Onglets jours */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {itinerary.map(item => (
              <button
                key={item.day}
                onClick={() => setActiveDay(item.day)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  backgroundColor: activeDay === item.day ? '#16a34a' : '#f3f4f6',
                  color: activeDay === item.day ? 'white' : '#374151'
                }}
              >
                Jour {item.day}
              </button>
            ))}
          </div>

          {/* Détail jour actif */}
          {itinerary.filter(item => item.day === activeDay).map(item => (
            <div key={item.day} style={{
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f0fdf4'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {item.activity}
                </h3>
                <span style={{
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '20px'
                }}>
                  {item.cost === 0 ? 'Gratuit' : `${item.cost} DT`}
                </span>
              </div>
              <p style={{ color: '#4b5563', fontSize: '13px', marginBottom: '12px' }}>
                {item.description?.slice(0, 200)}
              </p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                <span>⏱️ {item.duration_hours}h</span>
                <span>⭐ {item.rating}/5</span>
                <span>🎯 {item.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Restaurant + Hôtel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {recommended_restaurant && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
                🍽️ Restaurant recommandé
              </h2>
              <div style={{ color: '#15803d', fontWeight: '600', fontSize: '15px' }}>
                {recommended_restaurant.name}
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                {recommended_restaurant.cuisine}
              </div>
              <div style={{ color: '#4b5563', fontSize: '13px', marginTop: '8px' }}>
                💰 {recommended_restaurant.price_per_person} DT/personne
              </div>
              <div style={{ color: '#4b5563', fontSize: '13px' }}>
                ⭐ {recommended_restaurant.rating}/5
              </div>
            </div>
          )}

          {recommended_hotel && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
                🏨 Hôtel recommandé
              </h2>
              <div style={{ color: '#1d4ed8', fontWeight: '600', fontSize: '15px' }}>
                {recommended_hotel.name}
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                {'⭐'.repeat(recommended_hotel.stars)}
              </div>
              <div style={{ color: '#4b5563', fontSize: '13px', marginTop: '8px' }}>
                💰 {recommended_hotel.price_per_night} DT/nuit
              </div>
              <div style={{ color: '#4b5563', fontSize: '13px' }}>
                ⭐ {recommended_hotel.rating}/5
              </div>
            </div>
          )}
        </div>

        {/* Carte */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            🗺️ Carte du voyage
          </h2>
          <MapComponent itinerary={itinerary} city={city} />
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportPDF tripData={tripData} />
          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ← Planifier un nouveau voyage
          </button>
        </div>

      </div>

      {/* Chat Widget */}
      <ChatWidget tripData={tripData} />

    </div>
  )
}

export default Result