// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateTrip, getCities, getWeather, getReviews, postReview, getRewardsPoints } from '../services/api.js'
import { useAuth } from '../context/AuthContext'
import TunisiaMap from '../components/TunisiaMap'
import { useTheme } from '../context/ThemeContext'
import { generateTrip, getCities, getWeather, getReviews, postReview, getRewardsPoints, getPlaces } from '../services/api.js'

const CITIES_CONFIG = [
  {
    name: 'Tunis',
    emoji: '🕌',
    bg: 'linear-gradient(160deg,#0a2342 0%,#1a4a7a 60%,#0f6e56 100%)',
    image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&q=80',
    desc: 'Médinas, musées, patrimoine UNESCO'
  },
  {
    name: 'Sousse',
    emoji: '🏖️',
    bg: 'linear-gradient(160deg,#0f6e56 0%,#1a4a7a 60%,#04342c 100%)',
    image: 'https://images.unsplash.com/photo-1548813831-2c0e4d8d2a7b?w=400&q=80',
    desc: 'Plages, ribat, médina fortifiée'
  },
  {
    name: 'Djerba',
    emoji: '🌊',
    bg: 'linear-gradient(160deg,#023e8a 0%,#0077b6 50%,#0a2342 100%)',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80',
    desc: 'Île paradisiaque, plages cristallines'
  },
  {
    name: 'Kairouan',
    emoji: '🕍',
    bg: 'linear-gradient(160deg,#4a1800 0%,#7b2d00 50%,#1a1a2e 100%)',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80',
    desc: "4ème ville sainte de l'Islam"
  },
  {
    name: 'Sfax',
    emoji: '🏺',
    bg: 'linear-gradient(160deg,#1a3a1a 0%,#2d5a2d 50%,#0a2342 100%)',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    desc: 'Médina authentique, artisanat local'
  },
  {
    name: 'El Jem',
    emoji: '🛕',
    bg: 'linear-gradient(160deg,#5c2e0b 0%,#8B4513 50%,#1a1a2e 100%)',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80',
    desc: '3ème plus grand amphithéâtre romain'
  },
]

const TRANSLATIONS = {
  fr: {
    nav: { home: 'Accueil', search: 'Rechercher', dashboard: 'Dashboard', rewards: 'Récompenses', trips: 'Mes voyages', login: 'Connexion', register: "S'inscrire" },
    hero: { badge: 'Agent IA disponible 24h/24', title1: 'Explorez la', title2: "avec l'Intelligence Artificielle", subtitle: 'Itinéraires personnalisés • Météo en temps réel • Agent IA 24/7' },
    search: { plan: 'Planifier', hotels: 'Hôtels', activities: 'Activités', agent: 'Agent IA', dest: 'Destination', budget: 'Budget', duration: 'Durée', type: 'Type', generate: 'Générer', choose: 'Choisir une ville...', days: 'jours', types: { culture: '🛕 Culture', beach: '🏖️ Plage', relax: '🌿 Relax', adventure: '🏕️ Aventure' } },
    rewards: { title: '🏆 TuniGuide Récompenses', desc: 'Gagnez des points à chaque voyage et commentaire. Échangez contre des réductions.', btn: 'Rejoindre le programme', points: 'points disponibles', level: 'Niveau Or ✨' },
    destinations: { title: 'Destinations populaires', seeAll: 'Voir tout', places: 'lieux' },
    itineraries: { title: 'Itinéraires recommandés', seeAll: 'Voir tout', from: 'dès', per: '/ personne', click: 'Cliquez pour planifier' },
    reviews: { title: 'Avis de la communauté', seeAll: 'Voir tout', share: 'Partagez votre expérience', place: 'Lieu visité...', comment: 'Votre commentaire...', publish: 'Publier', upload: 'Ajouter des photos', noReviews: 'Soyez le premier à laisser un avis !' },
    features: { title: 'Pourquoi choisir TuniGuide AI ?' },
    footer: { about: 'À propos', services: 'Autres services', contact: 'Nous contacter', rights: '© 2026 TuniGuide AI – ISIm Sfax. Tous droits réservés.' },
    hotels: { title: 'Hôtels recommandés', desc: 'Générez un voyage pour voir les hôtels disponibles', btn: 'Planifier un voyage' },
    activities: { title: 'Activités populaires', desc: 'Générez un voyage pour voir les activités disponibles', btn: 'Planifier un voyage' },
    agent: { title: 'Agent IA TuniGuide', desc: 'Posez vos questions sur votre voyage en Tunisie', btn: "Ouvrir l'Agent IA" },
    aboutLinks: ["À propos de TuniGuide AI", "Notre équipe", "Carrières", "Conditions d'utilisation", "Confidentialité"],
    serviceLinks: ["API TuniGuide", "Programme partenaires", "Inscrire votre établissement", "Toutes les villes", "Devenir fournisseur"],
    contactLinks: ["🎧 Support client", "🛡️ Garantie service", "ℹ️ Centre d'aide", "📧 contact@tuniguide.ai"],
    payment: 'Paiement',
  },
  en: {
    nav: { home: 'Home', search: 'Search', dashboard: 'Dashboard', rewards: 'Rewards', trips: 'My trips', login: 'Login', register: 'Sign up' },
    hero: { badge: 'AI Agent available 24/7', title1: 'Explore', title2: 'with Artificial Intelligence', subtitle: 'Personalized itineraries • Real-time weather • AI Agent 24/7' },
    search: { plan: 'Plan', hotels: 'Hotels', activities: 'Activities', agent: 'AI Agent', dest: 'Destination', budget: 'Budget', duration: 'Duration', type: 'Type', generate: 'Generate', choose: 'Choose a city...', days: 'days', types: { culture: '🛕 Culture', beach: '🏖️ Beach', relax: '🌿 Relax', adventure: '🏕️ Adventure' } },
    rewards: { title: '🏆 TuniGuide Rewards', desc: 'Earn points with every trip and review. Redeem for exclusive discounts.', btn: 'Join the program', points: 'points available', level: 'Gold Level ✨' },
    destinations: { title: 'Popular destinations', seeAll: 'See all', places: 'places' },
    itineraries: { title: 'Recommended itineraries', seeAll: 'See all', from: 'from', per: '/ person', click: 'Click to plan' },
    reviews: { title: 'Community reviews', seeAll: 'See all', share: 'Share your experience', place: 'Place visited...', comment: 'Your comment...', publish: 'Publish', upload: 'Add photos', noReviews: 'Be the first to leave a review!' },
    features: { title: 'Why choose TuniGuide AI?' },
    footer: { about: 'About', services: 'Other services', contact: 'Contact us', rights: '© 2026 TuniGuide AI – ISIm Sfax. All rights reserved.' },
    hotels: { title: 'Recommended hotels', desc: 'Generate a trip to see available hotels', btn: 'Plan a trip' },
    activities: { title: 'Popular activities', desc: 'Generate a trip to see available activities', btn: 'Plan a trip' },
    agent: { title: 'TuniGuide AI Agent', desc: 'Ask any question about your trip to Tunisia', btn: 'Open AI Agent' },
    aboutLinks: ["About TuniGuide AI", "Our team", "Careers", "Terms of use", "Privacy"],
    serviceLinks: ["TuniGuide API", "Partner program", "List your property", "All cities", "Become a supplier"],
    contactLinks: ["🎧 Customer support", "🛡️ Service guarantee", "ℹ️ Help center", "📧 contact@tuniguide.ai"],
    payment: 'Payment',
  }
}

const RECOMMENDED = [
  { emoji: '🕌', bg: '#e8f5e9', title_fr: 'Culture & Histoire – Tunis', title_en: 'Culture & History – Tunis', meta_fr: '3 jours • Médinas, musées', meta_en: '3 days • Medinas, museums', price: 200, type: 'culture', city: 'Tunis', days: 3 },
  { emoji: '🏖️', bg: '#e3f2fd', title_fr: 'Plage & Détente – Djerba', title_en: 'Beach & Relaxation – Djerba', meta_fr: '5 jours • Plages, resorts', meta_en: '5 days • Beaches, resorts', price: 350, type: 'beach', city: 'Djerba', days: 5 },
  { emoji: '🛕', bg: '#fff8e1', title_fr: 'Antiquités – El Jem', title_en: 'Antiquities – El Jem', meta_fr: '2 jours • Amphithéâtre', meta_en: '2 days • Amphitheater', price: 150, type: 'culture', city: 'El Jem', days: 2 },
]

export default function Home({ setTripData }) {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [lang, setLang] = useState('fr')
  const [bgIndex, setBgIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [cities, setCities] = useState([])
  const [weather, setWeather] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('plan')
  const [formData, setFormData] = useState({ city: '', budget: 300, days: 3, type: 'culture' })
  const [reviewForm, setReviewForm] = useState({ user_name: '', place: '', city: '', rating: 5, comment: '', photo_url: '' })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [rewardsData, setRewardsData] = useState({ points: 0, level: 'Débutant', level_en: 'Starter' })
  const [scrolled, setScrolled] = useState(false)
  const [cityCounts, setCityCounts] = useState({})
  const fileRef = useRef()
  const t = TRANSLATIONS[lang]

  // ── Sticky navbar on scroll ───────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    getCities().then(res => setCities(res.data)).catch(() => {})
    getReviews().then(res => setReviews(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) setReviewForm(f => ({ ...f, user_name: user.name || '' }))
  }, [user])

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

  useEffect(() => {
    if (user && token) {
      getRewardsPoints(token).then(res => setRewardsData(res.data)).catch(() => {})
    }
  }, [user, token])

  useEffect(() => {
  const fetchCounts = async () => {
    const result = {}
    for (const c of ['Tunis', 'Sousse', 'Djerba', 'Kairouan', 'Sfax', 'El Jem']) {
      try {
        const res = await getPlaces(c)
        result[c] = res.data.length
      } catch {}
    }
    setCityCounts(result)
  }
  fetchCounts()
}, [])

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
      setReviewForm(f => ({ ...f, place: '', city: '', rating: 5, comment: '', photo_url: '' }))
      setPhotoPreview(null)
    } catch { } finally { setSubmitting(false) }
  }

  const handleRecommendedClick = (item) => {
    setFormData({ city: item.city, budget: item.price * 2, days: item.days, type: item.type })
    setActiveTab('plan')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const bg = CITIES_CONFIG[bgIndex]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>

      {/* ── STICKY NAVBAR (appears on scroll) ──────────────────── */}
      <div
  className="sticky-navbar"
  style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  backgroundColor: 'white',
  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  padding: '10px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transform: scrolled ? 'translateY(0)' : 'translateY(-100%)',
  transition: 'transform 0.3s ease',
}}>
        {/* Logo */}
        <div onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          style={{ fontSize: '18px', fontWeight: '600', cursor: 'pointer', color: '#1f2937' }}>
          Tuni<span style={{ color: '#1D9E75' }}>Guide</span> AI
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[
            { key: 'home', path: '/' },
            { key: 'search', path: '/search' },
            { key: 'dashboard', path: '/dashboard' },
            { key: 'rewards', path: '/rewards' },
            ...(user ? [{ key: 'trips', path: '/history' }] : []),
          ].map(item => (
            <span key={item.key} onClick={() => navigate(item.path)}
              style={{ color: '#4b5563', fontSize: '13px', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px', fontWeight: '500' }}
              onMouseEnter={e => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#1D9E75' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#4b5563' }}
            >
              {t.nav[item.key]}
            </span>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: '#f3f4f6', border: 'none', borderRadius: '20px', padding: '6px 10px', fontSize: '14px', cursor: 'pointer' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <span onClick={() => navigate('/profile')} style={{ color: '#1D9E75', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              👤 {user.name}
            </span>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{ background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                {t.nav.login}
              </button>
              <button onClick={() => navigate('/register')} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '20px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                {t.nav.register}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{ background: bg.bg, transition: 'background 1s ease' }}>

        {/* Hero navbar (always visible at top) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '8px' }}>
          <div onClick={() => navigate('/')} style={{ color: 'white', fontSize: '20px', fontWeight: '500', cursor: 'pointer' }}>
            Tuni<span style={{ color: '#4ade80' }}>Guide</span> AI
          </div>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { key: 'home', path: '/' },
              { key: 'search', path: '/search' },
              { key: 'dashboard', path: '/dashboard' },
              { key: 'rewards', path: '/rewards' },
              ...(user ? [{ key: 'trips', path: '/history' }] : []),
            ].map(item => (
              <span key={item.key} onClick={() => navigate(item.path)}
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', cursor: 'pointer', padding: '5px 8px', borderRadius: '6px' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                {t.nav[item.key]}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '5px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
              {['fr', 'en'].map(l => (
                <div key={l} onClick={() => setLang(l)} style={{ color: lang === l ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '12px', padding: '5px 10px', cursor: 'pointer', background: lang === l ? 'rgba(255,255,255,0.2)' : 'transparent', fontWeight: lang === l ? '500' : '400' }}>
                  {l.toUpperCase()}
                </div>
              ))}
            </div>
            {user ? (
              <span onClick={() => navigate('/profile')} style={{ color: '#4ade80', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                👤 {user.name}
              </span>
            ) : (
              <>
                <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                  {t.nav.login}
                </button>
                <button onClick={() => navigate('/register')} style={{ background: '#1D9E75', border: 'none', color: 'white', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                  {t.nav.register}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero content */}
        <div style={{ textAlign: 'center', padding: '40px 16px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 14px', color: 'rgba(255,255,255,0.9)', fontSize: '12px', marginBottom: '16px' }}>
            ✨ {t.hero.badge} •
            <span style={{ color: '#4ade80', fontWeight: '500', opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>
              {bg.emoji} {bg.name}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: '500', color: 'white', margin: '0 0 10px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {t.hero.title1} <span style={{ color: '#4ade80' }}>Tunisie</span><br />{t.hero.title2}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginBottom: '28px' }}>{t.hero.subtitle}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 40px)', marginBottom: '32px', flexWrap: 'wrap' }}>
            {[['6', lang === 'fr' ? 'Villes' : 'Cities'], [`${Object.values(cityCounts).reduce((a, b) => a + b, 0) || '136+'}`, lang === 'fr' ? 'Lieux' : 'Places'], ['24/7', 'Agent IA'], ['100%', lang === 'fr' ? 'Gratuit' : 'Free']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '500', color: '#4ade80' }}>{v}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search card */}
        <div style={{ background: 'white', borderRadius: '16px 16px 0 0', padding: '20px 16px', margin: '0 8px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '16px', overflowX: 'auto' }}>
            {[['plan', '🗺️', t.search.plan], ['hotels', '🏨', t.search.hotels], ['activities', '🎯', t.search.activities], ['agent', '🤖', t.search.agent]].map(([key, icon, label]) => (
              <div key={key} onClick={() => setActiveTab(key)} style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: `2px solid ${activeTab === key ? '#1D9E75' : 'transparent'}`, color: activeTab === key ? '#1D9E75' : '#6b7280', fontWeight: activeTab === key ? '500' : '400', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                {icon} {label}
              </div>
            ))}
          </div>

          {activeTab === 'plan' && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', alignItems: 'end' }}>
                <div style={{ gridColumn: 'span 2' }}>
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
                <button type="submit" disabled={loading || !formData.city} style={{ background: loading || !formData.city ? '#d1d5db' : '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: '500', cursor: loading || !formData.city ? 'not-allowed' : 'pointer', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  🔍 {loading ? '...' : t.search.generate}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'hotels' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏨</div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '6px' }}>{t.hotels.title}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{t.hotels.desc}</div>
              <button onClick={() => setActiveTab('plan')} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                🗺️ {t.hotels.btn}
              </button>
            </div>
          )}

          {activeTab === 'activities' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎯</div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '6px' }}>{t.activities.title}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{t.activities.desc}</div>
              <button onClick={() => setActiveTab('plan')} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                🗺️ {t.activities.btn}
              </button>
            </div>
          )}

          {activeTab === 'agent' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🤖</div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '6px' }}>{t.agent.title}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{t.agent.desc}</div>
              <button onClick={() => navigate('/result')} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                🤖 {t.agent.btn}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── REWARDS ───────────────────────────────────────────────── */}
      <div style={{ padding: '16px', background: '#f9fafb' }}>
        <div style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ color: 'white', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>{t.rewards.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '12px' }}>{t.rewards.desc}</div>
            <button onClick={() => navigate(user ? '/rewards' : '/register')} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '20px', padding: '7px 16px', fontSize: '12px', cursor: 'pointer' }}>
              {t.rewards.btn}
            </button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: '500', color: '#4ade80' }}>{user ? rewardsData.points : '—'}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
              {user ? t.rewards.points : (lang === 'fr' ? 'Connectez-vous pour voir vos points' : 'Login to see your points')}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              {user ? (lang === 'fr' ? `Niveau ${rewardsData.level}` : `${rewardsData.level_en} Level`) : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARTE INTERACTIVE ─────────────────────────────────────── */}
      <div style={{ padding: '16px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <TunisiaMap lang={lang} />
      </div>

      {/* ── DESTINATIONS ──────────────────────────────────────────── */}
      <div style={{ padding: '16px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{t.destinations.title}</div>
          <div onClick={() => navigate('/search')} style={{ fontSize: '12px', color: '#1D9E75', cursor: 'pointer' }}>{t.destinations.seeAll} ›</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
          {CITIES_CONFIG.map(city => (
            <div key={city.name} onClick={() => navigate(`/destination/${city.name}`)}
  style={{ borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', height: '140px', position: 'relative', border: '2px solid transparent', transition: 'all 0.2s' }}
  onMouseEnter={e => e.currentTarget.style.border = '2px solid #4ade80'}
  onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}
>
  {/* Real photo */}
  <img
    src={city.image}
    alt={city.name}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    onError={e => { e.target.style.display = 'none' }}
  />
  {/* Dark overlay */}
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)' }} />
  {/* Text */}
  <div style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 2 }}>
    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{city.emoji} {city.name}</div>
    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px' }}>{cityCounts[city.name] ? `${cityCounts[city.name]} ${t.destinations.places}` : ''}</div>
  </div>
</div>
          ))}
        </div>
      </div>

      {/* ── ITINERAIRES ───────────────────────────────────────────── */}
      <div style={{ padding: '16px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{t.itineraries.title}</div>
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ fontSize: '12px', color: '#1D9E75', cursor: 'pointer' }}>{t.itineraries.seeAll} ›</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {RECOMMENDED.map((item, i) => (
            <div key={i} onClick={() => handleRecommendedClick(item)}  
              style={{ border: '0.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ height: '90px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>{item.emoji}</div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '3px' }}>{lang === 'fr' ? item.title_fr : item.title_en}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>{lang === 'fr' ? item.meta_fr : item.meta_en}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1D9E75' }}>{t.itineraries.from} {item.price} DT <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '400' }}>{t.itineraries.per}</span></div>
                  <span style={{ fontSize: '11px', color: '#1D9E75', background: '#f0fdf4', padding: '3px 8px', borderRadius: '20px' }}>{t.itineraries.click} →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AVIS ──────────────────────────────────────────────────── */}
      <div style={{ padding: '16px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '14px' }}>{t.reviews.title}</div>
        <div style={{ border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: '#f9fafb' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>💬 {t.reviews.share}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '8px' }}>
            <input placeholder={t.reviews.place} value={reviewForm.place} onChange={e => setReviewForm(f => ({ ...f, place: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
            <select value={reviewForm.city} onChange={e => setReviewForm(f => ({ ...f, city: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}>
              <option value="">🏙️ {lang === 'fr' ? 'Ville...' : 'City...'}</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {[1,2,3,4,5].map(star => (
              <span key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))} style={{ fontSize: '22px', cursor: 'pointer', color: star <= reviewForm.rating ? '#f59e0b' : '#d1d5db' }}>★</span>
            ))}
          </div>
          <textarea placeholder={t.reviews.comment} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '70px', marginBottom: '8px', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div onClick={() => fileRef.current.click()} style={{ flex: 1, minWidth: '120px', border: '1.5px dashed #d1d5db', borderRadius: '8px', padding: '10px', textAlign: 'center', cursor: 'pointer', background: 'white' }}>
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
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '20px' }}>{t.reviews.noReviews}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {reviews.slice(0, 4).map((r, i) => (
              <div key={r._id || i} style={{ border: '0.5px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', color: '#0f6e56', flexShrink: 0 }}>
                    {(r.user_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{r.user_name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>📍 {r.place}{r.city ? ` • ${r.city}` : ''}</div>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '12px' }}>{'★'.repeat(r.rating)}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.5', marginBottom: '8px' }}>{r.comment}</div>
                {r.photo_url && <img src={r.photo_url} alt="avis" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '0.5px solid #e5e7eb' }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <div style={{ padding: '16px', background: 'white', borderBottom: '6px solid #f0f4f8' }}>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '14px' }}>{t.features.title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {[
            { icon: '🤖', title: 'Agent IA 24/7', desc: lang === 'fr' ? "Assistance en cas d'imprévus" : 'Assistance for unexpected situations', action: () => navigate('/result') },
            { icon: '🌤️', title: lang === 'fr' ? 'Météo live' : 'Live weather', desc: lang === 'fr' ? 'Conseils adaptés aux conditions' : 'Advice adapted to conditions', action: () => setActiveTab('plan') },
            { icon: '📄', title: 'Export PDF', desc: lang === 'fr' ? 'Téléchargez votre itinéraire' : 'Download your itinerary', action: () => navigate('/result') },
            { icon: '🗺️', title: lang === 'fr' ? 'Carte interactive' : 'Interactive map', desc: lang === 'fr' ? 'Visualisez votre voyage' : 'Visualize your trip', action: () => navigate('/result') },
          ].map((f, i) => (
            <div key={i} onClick={f.action} style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '0.5px solid #e5e7eb' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
              onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
            >
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>{f.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#1f2937', marginBottom: '3px' }}>{f.title}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <div style={{ background: '#0a1628', padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div>
            <div onClick={() => navigate('/')} style={{ color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '8px', cursor: 'pointer' }}>
              Tuni<span style={{ color: '#4ade80' }}>Guide</span> AI
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.6', marginBottom: '12px' }}>
              {lang === 'fr' ? 'Votre assistant intelligent pour explorer la Tunisie.' : 'Your intelligent assistant to explore Tunisia.'}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { icon: '📘', url: 'https://facebook.com' },
                { icon: '📸', url: 'https://instagram.com' },
                { icon: '🐦', url: 'https://twitter.com' },
                { icon: '💻', url: 'https://github.com/adamkas0987/tuniguide-ai' },
              ].map((s, i) => (
                <div key={i} onClick={() => window.open(s.url, '_blank')} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>{t.footer.about}</div>
            {t.aboutLinks.map((link, i) => (
              <div key={i} onClick={() => navigate('/')} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '7px', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
              >{link}</div>
            ))}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>{t.footer.services}</div>
            {t.serviceLinks.map((link, i) => (
              <div key={i} onClick={() => i === 3 ? navigate('/dashboard') : navigate('/')} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '7px', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
              >{link}</div>
            ))}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>{t.footer.contact}</div>
            {t.contactLinks.map((link, i) => (
              <div key={i} onClick={() => { if (i === 3) window.open('mailto:contact@tuniguide.ai'); else navigate('/') }}
                style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '7px', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
              >{link}</div>
            ))}
            <div style={{ marginTop: '12px' }}>
              <div style={{ color: 'white', fontSize: '11px', fontWeight: '500', marginBottom: '6px' }}>{t.payment}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Visa', 'Mastercard', 'PayPal'].map(p => (
                  <div key={p} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.footer.rights}</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Cookies', 'Sitemap'].map(l => (
              <span key={l} onClick={() => navigate('/')} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
