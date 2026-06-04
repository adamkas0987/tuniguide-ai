// src/pages/Search.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlaces } from '../services/api.js'
import PlaceImage from '../components/PlaceImage'
import RatingStars from '../components/RatingStars'

export default function Search() {
  const navigate = useNavigate()
  const [places, setPlaces]     = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)

  const [filters, setFilters] = useState({
    city:    '',
    type:    '',
    minRating: 0,
    maxPrice:  500,
    sortBy:    'rating',
    search:    '',
  })

  const CITIES = ['Tunis', 'Sousse', 'Sfax', 'Djerba', 'Kairouan', 'El Jem']
  const TYPES  = ['culture', 'beach', 'relax', 'adventure']

  useEffect(() => {
    // Charger tous les lieux
    Promise.all(CITIES.map(city => getPlaces(city)))
      .then(results => {
        const all = results.flatMap(r => r.data)
        setPlaces(all)
        setFiltered(all)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...places]

    if (filters.city)
      result = result.filter(p => p.city === filters.city)

    if (filters.type)
      result = result.filter(p => p.type === filters.type)

    if (filters.minRating > 0)
      result = result.filter(p => (p.rating || 0) >= filters.minRating)

    if (filters.maxPrice < 500)
      result = result.filter(p => (p.price || 0) <= filters.maxPrice)

    if (filters.search)
      result = result.filter(p =>
        p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase())
      )

    if (filters.sortBy === 'rating')
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (filters.sortBy === 'price_asc')
      result.sort((a, b) => (a.price || 0) - (b.price || 0))
    else if (filters.sortBy === 'price_desc')
      result.sort((a, b) => (b.price || 0) - (a.price || 0))
    else if (filters.sortBy === 'name')
      result.sort((a, b) => a.name?.localeCompare(b.name))

    setFiltered(result)
  }, [filters, places])

  const inputStyle = {
    width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '9px 12px', fontSize: '13px', outline: 'none',
    backgroundColor: 'white', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1D9E75,#0a2342)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: '500', margin: '0 0 16px' }}>
            🔍 Recherche avancée
          </h1>
          {/* Barre de recherche principale */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Rechercher un lieu, une activité..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ ...inputStyle, flex: 1, padding: '12px 16px', fontSize: '14px' }}
            />
            <button style={{ background: 'white', color: '#1D9E75', border: 'none', borderRadius: '10px', padding: '12px 20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🔍 Rechercher
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>

          {/* ── FILTRES ──────────────────── */}
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎛️ Filtres
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#1D9E75', cursor: 'pointer', fontWeight: '400' }} onClick={() => setFilters({ city: '', type: '', minRating: 0, maxPrice: 500, sortBy: 'rating', search: '' })}>
                  Réinitialiser
                </span>
              </h3>

              {/* Ville */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🏙️ Ville
                </label>
                <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} style={inputStyle}>
                  <option value="">Toutes les villes</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[['', 'Tous'], ['culture', '🏛️ Culture'], ['beach', '🏖️ Plage'], ['relax', '🌿 Relax'], ['adventure', '🏕️ Aventure']].map(([val, label]) => (
                    <button key={val} onClick={() => setFilters(f => ({ ...f, type: val }))} style={{ padding: '6px 8px', borderRadius: '8px', border: `1px solid ${filters.type === val ? '#1D9E75' : '#e5e7eb'}`, background: filters.type === val ? '#f0fdf4' : 'white', color: filters.type === val ? '#1D9E75' : '#374151', fontSize: '11px', cursor: 'pointer', fontWeight: filters.type === val ? '600' : '400' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note minimum */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⭐ Note minimum : {filters.minRating > 0 ? `${filters.minRating}/5` : 'Toutes'}
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0,1,2,3,4,5].map(r => (
                    <button key={r} onClick={() => setFilters(f => ({ ...f, minRating: r }))} style={{ flex: 1, padding: '5px 2px', borderRadius: '6px', border: `1px solid ${filters.minRating === r ? '#1D9E75' : '#e5e7eb'}`, background: filters.minRating === r ? '#f0fdf4' : 'white', color: filters.minRating === r ? '#1D9E75' : '#374151', fontSize: '11px', cursor: 'pointer', fontWeight: filters.minRating === r ? '600' : '400' }}>
                      {r === 0 ? 'Tous' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix maximum */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💰 Prix max : {filters.maxPrice >= 500 ? 'Tous' : `${filters.maxPrice} DT`}
                </label>
                <input type="range" min="0" max="500" step="10" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#1D9E75' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                  <span>0 DT</span><span>500 DT</span>
                </div>
              </div>

              {/* Tri */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Trier par
                </label>
                <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))} style={inputStyle}>
                  <option value="rating">⭐ Mieux notés</option>
                  <option value="price_asc">💰 Prix croissant</option>
                  <option value="price_desc">💰 Prix décroissant</option>
                  <option value="name">🔤 Nom A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── RESULTATS ────────────────── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <strong style={{ color: '#1f2937' }}>{filtered.length}</strong> lieu{filtered.length > 1 ? 'x' : ''} trouvé{filtered.length > 1 ? 's' : ''}
              </div>
              <button onClick={() => navigate('/')} style={{ background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>
                ← Retour
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                ⏳ Chargement des lieux...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '14px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>😕</div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '6px' }}>Aucun lieu trouvé</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Essayez de modifier vos filtres</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {filtered.map((place, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '0.5px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => navigate(`/destination/${place.city}`)}
                  >
                    <PlaceImage name={place.name} type={place.type} style={{ width: '100%', height: '120px' }} />
                    <div style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: 0, flex: 1, paddingRight: '6px' }}>{place.name}</h3>
                        <span style={{ background: '#f0fdf4', color: '#1D9E75', fontSize: '11px', padding: '2px 7px', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: '500' }}>
                          {place.price === 0 ? '✨ Gratuit' : `${place.price} DT`}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5', marginBottom: '8px' }}>
                        {(place.description || '').slice(0, 80)}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>🏙️ {place.city}</span>
                        <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>🎯 {place.type}</span>
                        <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>⏱️ {place.duration}h</span>
                      </div>
                      <RatingStars
                        placeName={place.name}
                        city={place.city}
                        initialRating={place.rating}
                        initialCount={place.ratings_count || 0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}