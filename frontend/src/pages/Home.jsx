// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateTrip, getCities, getWeather, getReviews, postReview } from '../services/api.js'
import { useAuth } from '../context/AuthContext'

const CITIES_CONFIG = [
  { name: 'Tunis',    emoji: '🕌', bg: 'linear-gradient(160deg,#0a2342 0%,#1a4a7a 60%,#0f6e56 100%)', desc: 'Médinas, musées, patrimoine UNESCO' },
  { name: 'Sousse',   emoji: '🏖️', bg: 'linear-gradient(160deg,#0f6e56 0%,#1a4a7a 60%,#04342c 100%)', desc: 'Plages, ribat, médina fortifiée' },
  { name: 'Djerba',   emoji: '🌊', bg: 'linear-gradient(160deg,#023e8a 0%,#0077b6 50%,#0a2342 100%)', desc: 'Île paradisiaque, plages cristallines' },
  { name: 'Kairouan', emoji: '🕍', bg: 'linear-gradient(160deg,#4a1800 0%,#7b2d00 50%,#1a1a2e 100%)', desc: '4ème ville sainte de l\'Islam' },
  { name: 'Sfax',     emoji: '🏺', bg: 'linear-gradient(160deg,#1a3a1a 0%,#2d5a2d 50%,#0a2342 100%)', desc: 'Médina authentique, artisanat local' },
  { name: 'El Jem',   emoji: '🏛️', bg: 'linear-gradient(160deg,#5c2e0b 0%,#8B4513 50%,#1a1a2e 100%)', desc: '3ème plus grand amphithéâtre romain' },
]

const TRANSLATIONS = {
  fr: {
    nav: { home: 'Accueil', destinations: 'Destinations', dashboard: 'Dashboard', rewards: 'Récompenses', trips: 'Mes voyages', login: 'Connexion', register: "S'inscrire" },
    hero: { badge: 'Agent IA disponible 24h/24', title1: 'Explorez la', title2: 'avec l\'Intelligence Artificielle', subtitle: 'Itinéraires personnalisés • Météo en temps réel • Agent IA 24/7' },
    search: { plan: 'Planifier', hotels: 'Hôtels', activities: 'Activités', agent: 'Agent IA', dest: 'Destination', budget: 'Budget', duration: 'Durée', type: 'Type', generate: 'Générer', choose: 'Choisir une ville...', days: 'jours', types: { culture: '🏛️ Culture', beach: '🏖️ Plage', relax: '🌿 Relax', adventure: '🏕️ Aventure' } },
    rewards: { title: '🏆 TuniGuide Récompenses', desc: 'Gagnez des points à chaque voyage et commentaire. Échangez contre des réductions.', btn: 'Rejoindre', points: 'points disponibles', level: 'Niveau Or ✨' },
    destinations: { title: 'Destinations populaires', seeAll: 'Voir tout', places: 'lieux' },
    itineraries: { title: 'Itinéraires recommandés', seeAll: 'Voir tout', from: 'dès', per: '/ personne', days: 'jours' },
    reviews: { title: 'Avis de la communauté', seeAll: 'Voir tout', share: 'Partagez votre expérience', place: 'Lieu visité...', comment: 'Votre commentaire...', publish: 'Publier', upload: 'Ajouter des photos', browse: 'Parcourir', noReviews: 'Soyez le premier à laisser un avis !' },
    features: { title: 'Pourquoi choisir TuniGuide AI ?' },
    footer: { about: 'À propos', services: 'Autres services', contact: 'Nous contacter', rights: '© 2026 TuniGuide AI — ISIm Sfax. Tous droits réservés.' }
  },
  en: {
    nav: { home: 'Home', destinations: 'Destinations', dashboard: 'Dashboard', rewards: 'Rewards', trips: 'My trips', login: 'Login', register: 'Sign up' },
    hero: { badge: 'AI Agent available 24/7', title1: 'Explore', title2: 'with Artificial Intelligence', subtitle: 'Personalized itineraries • Real-time weather • AI Agent 24/7' },
    search: { plan: 'Plan', hotels: 'Hotels', activities: 'Activities', agent: 'AI Agent', dest: 'Destination', budget: 'Budget', duration: 'Duration', type: 'Type', generate: 'Generate', choose: 'Choose a city...', days: 'days', types: { culture: '🏛️ Culture', beach: '🏖️ Beach', relax: '🌿 Relax', adventure: '🏕️ Adventure' } },
    rewards: { title: '🏆 TuniGuide Rewards', desc: 'Earn points with every trip and review. Redeem for exclusive discounts.', btn: 'Join now', points: 'points available', level: 'Gold Level ✨' },
    destinations: { title: 'Popular destinations', seeAll: 'See all', places: 'places' },
    itineraries: { title: 'Recommended itineraries', seeAll: 'See all', from: 'from', per: '/ person', days: 'days' },
    reviews: { title: 'Community reviews', seeAll: 'See all', share: 'Share your experience', place: 'Place visited...', comment: 'Your comment...', publish: 'Publish', upload: 'Add photos', browse: 'Browse', noReviews: 'Be the first to leave a review!' },
    features: { title: 'Why choose TuniGuide AI?' },
    footer: { about: 'About', services: 'Other services', contact: 'Contact us', rights: '© 2026 TuniGuide AI — ISIm Sfax. All rights reserved.' }
  }
}

const RECOMMENDED = [
  { emoji: '🕌', bg: '#e8f5e9', title_fr: 'Culture & Histoire — Tunis', title_en: 'Culture & History — Tunis', meta_fr: '3 jours • Médinas, musées', meta_en: '3 days • Medinas, museums', price: 200, type: 'culture', city: 'Tunis' },
  { emoji: '🏖️', bg: '#e3f2fd', title_fr: 'Plage & Détente — Djerba', title_en: 'Beach & Relaxation — Djerba', meta_fr: '5 jours • Plages, resorts', meta_en: '5 days • Beaches, resorts', price: 350, type: 'beach', city: 'Djerba' },
  { emoji: '🏛️', bg: '#fff8e1', title_fr: 'Antiquités — El Jem', title_en: 'Antiquities — El Jem', meta_fr: '2 jours • Amphithéâtre', meta_en: '2 days • Amphitheater', price: 150, type: 'culture', city: 'El Jem' },
]

export default function Home({ setTripData }) {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [lang, setLang]         = useState('fr')
  const [bgIndex, setBgIndex]   = useState(0)
  const [visible, setVisible]   = useState(true)
  const [cities, setCities]     = useState([])
  const [weather, setWeather]   = useState(null)
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [activeTab, setActiveTab] = useState('plan')
  const [formData, setFormData] = useState({ city: '', budget: 300, days: 3, type: 'culture' })
  const [reviewForm, setReviewForm] = useState({ user_name: user?.name || '', place: '', city: '', rating: 5, comment: '', photo_url: '' })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  const t = TRANSLATIONS[lang]

  useEffect(() => {
    getCities().then(res => setCities(res.data)).catch(() => {})
    getReviews().then(res => setReviews(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setBgIndex(i => (i + 1) % CITIES_CONFIG.length); setVisible(true) }, 500)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (formData.city) getWeather(formData.city).then(r => setWeather(r.data)).catch(() => setWeather(null))
  }, [formData.city])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await generateTrip(formData)
      setTripData(res.data)
      navigate('/result')
    } catch { } finally { setLoading(false) }
  }

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setPhotoPreview(ev.target.result)
      setReviewForm(f => ({ ...f, photo_url: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handlePostReview = async () => {
    if (!reviewForm.comment || !reviewForm.place) return
    setSubmitting(true)
    try {
      const res = await postReview({ ...reviewForm, user_name: user?.name || reviewForm.user_name || 'Anonyme' })
      setReviews(prev => [res.data.review, ...prev])
      setReviewForm({ user_name: user?.name || '', place: '', city: '', rating: 5, comment: '', photo_url: '' })
      setPhotoPreview(null)
    } catch { } finally { setSubmitting(false) }
  }

  const bg = CITIES_CONFIG[bgIndex]

  const s = (light, dark) => light

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>

      {/* ── HERO ──────────────────────────────── */}
      <div style={{ background: bg.bg, transition: 'background 1s ease', paddingBottom: 0 }}>

        {/* Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: '500' }}>
            Tuni<span style={{ color: '#4ade80' }}>Guide</span> AI
          </div>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            {[
              { key: 'home', path: '/' },
              { key: 'dashboard', path: '/dashboard' },
              { key: 'rewards', path: '#' },
              ...(user ? [{ key: 'trips', path: '/history' }] : [])
            ].map(item => (
              <span key={item.key} onClick={() => navigate(item.path)} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', cursor: 'pointer', padding: '5px 8px', borderRadius: '6px' }}>
                {t.nav[item.key]}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Switch FR/EN */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
              {['fr', 'en'].map(l => (
                <div key={l} onClick={() => setLang(l)} style={{ color: lang === l ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '12px', padding: '5px 12px', cursor: 'pointer', background: lang === l ? 'rgba(255,255,255,0.2)' : 'transparent', fontWeight: lang === l ? '500' : '400' }}>
                  {l.toUpperCase()}
                </div>
              ))}
            </div>
            {user ? (
              <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: '500' }}>👤 {user.name}</span>
            ) : (
              <>
                <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>
                  {t.nav.login}
                </button>
                <button onClick={() => navigate('/register')} style={{ background: '#1D9E75', border: 'none', color: 'white', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>
                  {t.nav.register}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero content */}
        <div style={{ textAlign: 'center', padding: '40px 24px 0', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 14px', color: 'rgba(255,255,255,0.9)', fontSize: '12px', marginBottom: '16px' }}>
            ✨ {t.hero.badge} •
            <span style={{ color: '#4ade80', fontWeight: '500', opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>
              {bg.emoji} {bg.name}
            </span>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: '500', color: 'white', margin: '0 0 10px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {t.hero.title1} <span style={{ color: '#4ade80' }}>Tunisie</span><br />{t.hero.title2}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginBottom: '28px' }}>
            {t.hero.subtitle}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '32px' }}>
            {[['6', lang === 'fr' ? 'Villes' : 'Cities'], ['96+', lang === 'fr' ? 'Lieux' : 'Places'], ['24/7', 'Agent IA'], ['100%', lang === 'fr' ? 'Gratuit' : 'Free']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '500', color: '#4ade80' }}>{v}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search card */}
        <div style={{ background: 'white', borderRadius: '16px 16px 0 0', padding: '20px 24px', margin: '0 16px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
            {[['plan', '🗺️', t.search.plan], ['hotels', '🏨', t.search.hotels], ['activities', '🎯', t.search.activities], ['agent', '🤖', t.search.agent]].map(([key, icon, label]) => (
              <div key={key} onClick={() => setActiveTab(key)} style={{ padding: '8px 14px', fontSize: '12px', cursor: 'pointer', borderBottom: `2px solid ${activeTab === key ? '#1D9E75' : 'transparent'}`, color: activeTab === key ? '#1D9E75' : '#6b7280', fontWeight: activeTab === key ? '500' : '400', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {icon} {label}
              </div>
            ))}
          </div>

          {activeTab === 'plan' && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.search.dest}</div>
                  <select name="city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', backgroundColor: '#fafafa', outline: 'none' }}>
                    <option value="">{t.search.choose}</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {weather && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', color: '#1d4ed8' }}>
                      {weather.is_sunny ? '☀️' : '🌤️'} <strong>{weather.temperature}°C</strong> — {weather.description}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.search.budget}</div>
                  <select value={formData.budget} onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', backgroundColor: '#fafafa', outline: 'none' }}>
                    {[100, 200, 300, 500, 800, 1000, 1500, 2000].map(b => <option key={b} value={b}>{b} DT</option>)}
                  </select>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.search.duration}</div>
                  <select value={formData.days} onChange={e => setFormData({ ...formData, days: Number(e.target.value) })} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', backgroundColor: '#fafafa', outline: 'none' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(d => <option key={d} value={d}>{d} {t.search.days}</option>)}
                  </select>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.search.type}</div>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', backgroundColor: '#fafafa', outline: 'none' }}>
                    {Object.entries(t.search.types).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={loading || !formData.city} style={{ background: loading || !formData.city ? '#d1d5db' : '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: loading || !formData.city ? 'not-allowed' : 'pointer', height: '40px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔍 {loading ? '...' : t.search.generate}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'agent' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '6px' }}>Agent IA TuniGuide</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Posez n'importe quelle question sur votre voyage en Tunisie</div>
              <button onClick={() => navigate('/result')} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
                Ouvrir l'Agent IA 🤖
              </button>
            </div>
          )}

          {(activeTab === 'hotels' || activeTab === 'activities') && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b7280', fontSize: '13px' }}>
              🚧 {lang === 'fr' ? 'Bientôt disponible — utilisez "Planifier" pour générer un voyage complet' : 'Coming soon — use "Plan" to generate a complete trip'}
            </div>
          )}
        </div>
      </div>

      {/* ── REWARDS ──────────────────────────── */}
      <div style={{ padding: '16px 24px', background: '#f9fafb' }}>
        <div style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)', borderRadius: '14px', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'white', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>{t.rewards.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '12px' }}>{t.rewards.desc}</div>
            <button style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '20px', padding: '7px 16px', fontSize: '12px', cursor: 'pointer' }}>
              {t.rewards.btn}
            </button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: '500', color: '#4ade80' }}>1,250</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{t.rewards.points}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{t.rewards.level}</div>
          </div>
        </div>
      </div>

      {/* ── DESTINATIONS ─────────────────────── */}
      <div style={{ padding: '16px 24px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{t.destinations.title}</div>
          <div style={{ fontSize: '12px', color: '#1D9E75', cursor: 'pointer' }}>{t.destinations.seeAll} ›</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
          {CITIES_CONFIG.map(city => (
            <div key={city.name} onClick={() => setFormData(f => ({ ...f, city: city.name }))} style={{ borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', height: '110px', background: city.bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8px', position: 'relative', border: formData.city === city.name ? '2px solid #4ade80' : '2px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: '500' }}>{city.emoji} {city.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px' }}>
                  {cities.includes(city.name) ? `20 ${t.destinations.places}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ITINERAIRES RECOMMANDES ───────────── */}
      <div style={{ padding: '16px 24px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{t.itineraries.title}</div>
          <div style={{ fontSize: '12px', color: '#1D9E75', cursor: 'pointer' }}>{t.itineraries.seeAll} ›</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {RECOMMENDED.map((item, i) => (
            <div key={i} onClick={() => { setFormData({ city: item.city, budget: item.price * 2, days: parseInt(item.meta_fr), type: item.type }); navigate('/') }} style={{ border: '0.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ height: '90px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>{item.emoji}</div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '3px' }}>{lang === 'fr' ? item.title_fr : item.title_en}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>{lang === 'fr' ? item.meta_fr : item.meta_en}</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1D9E75' }}>{t.itineraries.from} {item.price} DT <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '400' }}>{t.itineraries.per}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AVIS COMMUNAUTE ──────────────────── */}
      <div style={{ padding: '16px 24px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{t.reviews.title}</div>
          <div style={{ fontSize: '12px', color: '#1D9E75', cursor: 'pointer' }}>{t.reviews.seeAll} ›</div>
        </div>

        {/* Formulaire avis */}
        <div style={{ border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: '#f9fafb' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>
            💬 {t.reviews.share}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input placeholder={t.reviews.place} value={reviewForm.place} onChange={e => setReviewForm(f => ({ ...f, place: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
            <select value={reviewForm.city} onChange={e => setReviewForm(f => ({ ...f, city: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}>
              <option value="">🏙️ Ville...</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Étoiles */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {[1,2,3,4,5].map(star => (
              <span key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))} style={{ fontSize: '20px', cursor: 'pointer', color: star <= reviewForm.rating ? '#f59e0b' : '#d1d5db' }}>★</span>
            ))}
          </div>

          <textarea placeholder={t.reviews.comment} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '70px', marginBottom: '8px', boxSizing: 'border-box' }} />

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div onClick={() => fileRef.current.click()} style={{ flex: 1, border: '1.5px dashed #d1d5db', borderRadius: '8px', padding: '10px', textAlign: 'center', cursor: 'pointer', background: 'white' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="preview" style={{ height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>📸 {t.reviews.upload}</div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            <button onClick={handlePostReview} disabled={submitting || !reviewForm.comment || !reviewForm.place} style={{ background: submitting || !reviewForm.comment || !reviewForm.place ? '#d1d5db' : '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {submitting ? '...' : `📤 ${t.reviews.publish}`}
            </button>
          </div>
        </div>

        {/* Liste des avis */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '20px' }}>
            {t.reviews.noReviews}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {reviews.slice(0, 4).map((r, i) => (
              <div key={r._id || i} style={{ border: '0.5px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', color: '#0f6e56', flexShrink: 0 }}>
                    {(r.user_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{r.user_name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>📍 {r.place} {r.city ? `• ${r.city}` : ''}</div>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '12px' }}>{'★'.repeat(r.rating)}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.5', marginBottom: '8px' }}>{r.comment}</div>
                {r.photo_url && (
                  <img src={r.photo_url} alt="avis" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '0.5px solid #e5e7eb' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FEATURES ─────────────────────────── */}
      <div style={{ padding: '16px 24px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '14px' }}>
          {t.features.title}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { icon: '🤖', title: 'Agent IA 24/7', desc: lang === 'fr' ? 'Assistance en cas d\'imprévus' : 'Assistance for unexpected situations' },
            { icon: '🌤️', title: lang === 'fr' ? 'Météo live' : 'Live weather', desc: lang === 'fr' ? 'Conseils adaptés aux conditions' : 'Advice adapted to conditions' },
            { icon: '📄', title: 'Export PDF', desc: lang === 'fr' ? 'Téléchargez votre itinéraire' : 'Download your itinerary' },
            { icon: '🗺️', title: lang === 'fr' ? 'Carte interactive' : 'Interactive map', desc: lang === 'fr' ? 'Visualisez votre voyage' : 'Visualize your trip' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>{f.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#1f2937', marginBottom: '3px' }}>{f.title}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────── */}
      <div style={{ background: '#0a1628', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>

          {/* Logo + social */}
          <div>
            <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              Tuni<span style={{ color: '#4ade80' }}>Guide</span> AI
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.6', marginBottom: '12px' }}>
              {lang === 'fr' ? 'Votre assistant intelligent pour explorer la Tunisie.' : 'Your intelligent assistant to explore Tunisia.'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['📘', '📸', '🐦', '💻'].map((icon, i) => (
                <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px' }}>{icon}</div>
              ))}
            </div>
          </div>

          {/* À propos */}
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>{t.footer.about}</div>
            {(lang === 'fr' ? ['À propos de TuniGuide AI', 'Notre équipe', 'Carrières', 'Conditions d\'utilisation', 'Confidentialité'] : ['About TuniGuide AI', 'Our team', 'Careers', 'Terms of use', 'Privacy']).map(link => (
              <div key={link} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '7px', cursor: 'pointer' }}>{link}</div>
            ))}
          </div>

          {/* Autres services */}
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>{t.footer.services}</div>
            {(lang === 'fr' ? ['API TuniGuide', 'Programme partenaires', 'Inscrire votre établissement', 'Toutes les villes', 'Devenir fournisseur'] : ['TuniGuide API', 'Partner program', 'List your property', 'All cities', 'Become a supplier']).map(link => (
              <div key={link} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '7px', cursor: 'pointer' }}>{link}</div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>{t.footer.contact}</div>
            {(lang === 'fr' ? ['🎧 Support client', '🛡️ Garantie service', 'ℹ️ Centre d\'aide', '📧 contact@tuniguide.ai'] : ['🎧 Customer support', '🛡️ Service guarantee', 'ℹ️ Help center', '📧 contact@tuniguide.ai']).map(link => (
              <div key={link} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '7px', cursor: 'pointer' }}>{link}</div>
            ))}
            <div style={{ marginTop: '12px' }}>
              <div style={{ color: 'white', fontSize: '11px', fontWeight: '500', marginBottom: '6px' }}>
                {lang === 'fr' ? 'Paiement' : 'Payment'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Visa', 'Mastercard', 'PayPal'].map(p => (
                  <div key={p} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.footer.rights}</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Cookies', 'Sitemap'].map(l => (
              <span key={l} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}