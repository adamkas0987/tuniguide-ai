// src/pages/Booking.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createBooking } from '../services/api.js'
import { useAuth } from '../context/AuthContext'

export default function Booking() {
  const { type, name, city, price } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isHotel = type === 'hotel'

  const [form, setForm] = useState({
    user_name:  user?.name || '',
    user_email: '',
    check_in:   '',
    check_out:  '',
    date:       '',
    guests:     1,
    requests:   '',
  })
  const [loading, setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(null)
  const [error, setError]       = useState(null)

  const nights = isHotel && form.check_in && form.check_out
    ? Math.max(1, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / (1000 * 60 * 60 * 24)))
    : 1

  const totalPrice = isHotel
    ? Number(price) * nights * form.guests
    : Number(price) * form.guests

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await createBooking({
        type,
        name: decodeURIComponent(name),
        city,
        price: totalPrice,
        ...form
      })
      setConfirmed(res.data.booking)
    } catch {
      setError('Erreur lors de la réservation. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  // ── Confirmation ─────────────────────────
  if (confirmed) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            Réservation confirmée !
          </h2>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
              <strong>{isHotel ? '🏨 Hôtel' : '🍽️ Restaurant'} :</strong> {decodeURIComponent(name)}
            </div>
            <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
              <strong>📍 Ville :</strong> {city}
            </div>
            <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
              <strong>👤 Nom :</strong> {confirmed.user_name}
            </div>
            {isHotel ? (
              <>
                <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
                  <strong>📅 Check-in :</strong> {confirmed.check_in}
                </div>
                <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
                  <strong>📅 Check-out :</strong> {confirmed.check_out}
                </div>
                <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
                  <strong>🌙 Nuits :</strong> {nights}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
                <strong>📅 Date :</strong> {confirmed.date}
              </div>
            )}
            <div style={{ fontSize: '13px', color: '#1f2937', marginBottom: '6px' }}>
              <strong>👥 Personnes :</strong> {confirmed.guests}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1D9E75', marginTop: '8px' }}>
              💰 Total : {confirmed.price} DT
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate(`/destination/${city}`)} style={{ flex: 1, background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '13px', cursor: 'pointer' }}>
              ← Retour à {city}
            </button>
            <button onClick={() => navigate('/')} style={{ flex: 1, background: '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              🗺️ Planifier un voyage
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulaire ───────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ background: isHotel ? 'linear-gradient(135deg,#1e40af,#2563eb)' : 'linear-gradient(135deg,#92400e,#f59e0b)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>{isHotel ? '🏨' : '🍽️'}</div>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '500', margin: '0 0 4px' }}>
          {isHotel ? 'Réserver un hôtel' : 'Réserver une table'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>
          {decodeURIComponent(name)} — {city}
        </p>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Nom */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                👤 Nom complet
              </label>
              <input type="text" required value={form.user_name} onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))} placeholder="Votre nom" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📧 Email
              </label>
              <input type="email" required value={form.user_email} onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))} placeholder="votre@email.com" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Dates hôtel */}
            {isHotel ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📅 Check-in
                  </label>
                  <input type="date" required value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📅 Check-out
                  </label>
                  <input type="date" required value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} min={form.check_in || new Date().toISOString().split('T')[0]} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📅 Date de réservation
                </label>
                <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            {/* Nombre de personnes */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                👥 Nombre de {isHotel ? 'personnes' : 'couverts'}
              </label>
              <select value={form.guests} onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', backgroundColor: 'white' }}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {isHotel ? 'personne(s)' : 'couvert(s)'}</option>)}
              </select>
            </div>

            {/* Demandes spéciales */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                💬 Demandes spéciales (optionnel)
              </label>
              <textarea value={form.requests} onChange={e => setForm(f => ({ ...f, requests: e.target.value }))} placeholder="Ex: chambre non-fumeur, allergie alimentaire..." style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '70px', boxSizing: 'border-box' }} />
            </div>

            {/* Résumé prix */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                📋 Résumé de la réservation
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
                <span>{decodeURIComponent(name)}</span>
                <span>{price} DT/{isHotel ? 'nuit' : 'pers'}</span>
              </div>
              {isHotel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
                  <span>× {nights} nuit(s) × {form.guests} pers</span>
                  <span></span>
                </div>
              )}
              {!isHotel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
                  <span>× {form.guests} couvert(s)</span>
                  <span></span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1D9E75' }}>{totalPrice} DT</span>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#d1d5db' : (isHotel ? '#2563eb' : '#f59e0b'), color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Confirmation...' : `✅ Confirmer la réservation — ${totalPrice} DT`}
            </button>

          </form>
        </div>

        <button onClick={() => navigate(-1)} style={{ width: '100%', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', cursor: 'pointer', marginTop: '12px' }}>
          ← Retour
        </button>
      </div>
    </div>
  )
}