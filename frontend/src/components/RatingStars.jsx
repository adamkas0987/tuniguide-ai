// src/components/RatingStars.jsx
import { useState, useEffect } from 'react'
import { addRating, getRatings } from '../services/api.js'
import { useAuth } from '../context/AuthContext'

export default function RatingStars({ placeName, city, initialRating = 0, initialCount = 0 }) {
  const { user } = useAuth()
  const [average, setAverage]   = useState(initialRating)
  const [count, setCount]       = useState(initialCount)
  const [hover, setHover]       = useState(0)
  const [selected, setSelected] = useState(0)
  const [loading, setLoading]   = useState(false)
  const [voted, setVoted]       = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    getRatings(placeName)
      .then(res => {
        if (res.data.count > 0) {
          setAverage(res.data.average)
          setCount(res.data.count)
        }
      })
      .catch(() => {})
  }, [placeName])

  const handleRate = async (star) => {
    if (!user) { setShowForm(true); return }
    if (voted || loading) return
    setSelected(star)
    setLoading(true)
    try {
      const res = await addRating({
        place_name: placeName,
        city,
        rating: star,
        user_name: user.name
      })
      setAverage(res.data.average)
      setCount(res.data.count)
      setVoted(true)
    } catch { } finally { setLoading(false) }
  }

  return (
    <div>
      {/* Affichage note moyenne */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1,2,3,4,5].map(star => (
            <span key={star} style={{
              fontSize: '16px',
              color: star <= Math.round(average) ? '#f59e0b' : '#d1d5db',
            }}>★</span>
          ))}
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{average > 0 ? average : '—'}</span>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>({count} {count === 1 ? 'avis' : 'avis'})</span>
      </div>

      {/* Formulaire notation */}
      {!voted ? (
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
            {user ? 'Notez ce lieu :' : 'Connectez-vous pour noter'}
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1,2,3,4,5].map(star => (
              <span
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: '20px',
                  cursor: user ? 'pointer' : 'default',
                  color: star <= (hover || selected) ? '#f59e0b' : '#d1d5db',
                  transition: 'color 0.1s'
                }}
              >★</span>
            ))}
          </div>
          {showForm && !user && (
            <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
              Connectez-vous pour noter ce lieu
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '500' }}>
          ✅ Merci pour votre note !
        </div>
      )}
    </div>
  )
}