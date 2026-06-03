// src/pages/History.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function History() {
  const navigate          = useNavigate()
  const { user, getHistory } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await getHistory()
      setTrips(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        ⏳ Chargement de l'historique...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            🗺️ Mes voyages
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Bonjour {user?.name} — historique de vos voyages générés
          </p>
        </div>

        {/* Pas de voyages */}
        {trips.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
              Aucun voyage sauvegardé
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>
              Générez votre premier voyage pour le voir ici
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: '20px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Planifier un voyage
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trips.map((trip, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Header trip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      🗺️ {trip.city}
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {[
                        `📅 ${trip.days} jour${trip.days > 1 ? 's' : ''}`,
                        `💰 ${trip.budget} DT`,
                        `🎯 ${trip.type}`
                      ].map((item, i) => (
                        <span key={i} style={{
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Coût total */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                      {trip.cost_summary?.total || 0} DT
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
                  </div>
                </div>

                {/* Itinéraire résumé */}
                {trip.itinerary && trip.itinerary.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Activités :
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {trip.itinerary.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                          <span style={{ color: '#16a34a', fontWeight: '600' }}>Jour {item.day}</span>
                          <span>{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Bouton nouveau voyage */}
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '24px',
            width: '100%',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Planifier un nouveau voyage
        </button>

      </div>
    </div>
  )
}

export default History