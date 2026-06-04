// src/pages/Rewards.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRewardsPoints } from '../services/api.js'

const LEVELS = [
  { name: 'Débutant', name_en: 'Starter', min: 0, max: 199, color: '#6b7280', bg: '#f3f4f6', icon: '🌱', perks_fr: ['Accès à la génération d\'itinéraires', 'Agent IA de base', 'Export PDF'], perks_en: ['Access to itinerary generation', 'Basic AI Agent', 'PDF Export'] },
  { name: 'Bronze', name_en: 'Bronze', min: 200, max: 499, color: '#92400e', bg: '#fef3c7', icon: '🥉', perks_fr: ['Tout niveau Débutant', 'Historique illimité', 'Suggestions météo avancées'], perks_en: ['All Starter perks', 'Unlimited history', 'Advanced weather suggestions'] },
  { name: 'Argent', name_en: 'Silver', min: 500, max: 999, color: '#374151', bg: '#f3f4f6', icon: '🥈', perks_fr: ['Tout niveau Bronze', 'Recommandations personnalisées', 'Priorité support client'], perks_en: ['All Bronze perks', 'Personalized recommendations', 'Priority customer support'] },
  { name: 'Or', name_en: 'Gold', min: 1000, max: 9999, color: '#92400e', bg: '#fef3c7', icon: '🥇', perks_fr: ['Tout niveau Argent', 'Accès exclusif aux nouveautés', 'Réductions partenaires', 'Badge Or visible'], perks_en: ['All Silver perks', 'Exclusive early access', 'Partner discounts', 'Visible Gold badge'] },
]

export default function Rewards() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [points, setPoints] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lang] = useState('fr')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getRewardsPoints(token)
      .then(res => setPoints(res.data))
      .catch(() => setPoints({ points: 0, level: 'Débutant', trips_count: 0, reviews_count: 0, next_level: 'Bronze', next_points: 200 }))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#6b7280' }}>
      ⏳ Chargement...
    </div>
  )

  const currentLevel = LEVELS.find(l => l.name === points?.level) || LEVELS[0]
  const progressPct = points ? Math.min(100, ((points.points - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '500', margin: '0 0 8px' }}>
          {lang === 'fr' ? 'TuniGuide Récompenses' : 'TuniGuide Rewards'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>
          {lang === 'fr' ? `Bonjour ${user?.name} ! Voici votre progression.` : `Hello ${user?.name}! Here is your progress.`}
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

        {/* Points card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', fontWeight: '700', color: '#1D9E75', marginBottom: '4px' }}>
            {points?.points || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            {lang === 'fr' ? 'points disponibles' : 'points available'}
          </div>

          {/* Niveau actuel */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: currentLevel.bg, padding: '8px 20px', borderRadius: '30px', marginBottom: '20px' }}>
            <span style={{ fontSize: '20px' }}>{currentLevel.icon}</span>
            <span style={{ fontSize: '15px', fontWeight: '600', color: currentLevel.color }}>
              {lang === 'fr' ? `Niveau ${currentLevel.name}` : `${currentLevel.name_en} Level`}
            </span>
          </div>

          {/* Progress bar */}
          {points?.next_level && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                <span>{points.points} pts</span>
                <span>{lang === 'fr' ? `Prochain niveau : ${points.next_level}` : `Next level: ${points.next_level}`} ({points.next_points} pts {lang === 'fr' ? 'restants' : 'remaining'})</span>
              </div>
              <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#1D9E75,#4ade80)', borderRadius: '10px', transition: 'width 1s ease' }} />
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
            {[
              { icon: '🗺️', value: points?.trips_count || 0, label: lang === 'fr' ? 'Voyages planifiés' : 'Trips planned', pts: '+100 pts/voyage' },
              { icon: '💬', value: points?.reviews_count || 0, label: lang === 'fr' ? 'Avis publiés' : 'Reviews posted', pts: '+50 pts/avis' },
              { icon: '🏆', value: points?.points || 0, label: lang === 'fr' ? 'Points totaux' : 'Total points', pts: '' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#1D9E75' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.label}</div>
                {s.pts && <div style={{ fontSize: '11px', color: '#1D9E75', marginTop: '2px' }}>{s.pts}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Niveaux */}
        <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
          {lang === 'fr' ? '🎯 Les niveaux de récompenses' : '🎯 Reward levels'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {LEVELS.map((level, i) => {
            const isCurrent = level.name === points?.level
            return (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: isCurrent ? `2px solid #1D9E75` : '2px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{level.icon}</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: level.color }}>{lang === 'fr' ? level.name : level.name_en}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{level.min} — {level.max === 9999 ? '∞' : level.max} pts</div>
                  </div>
                  {isCurrent && <span style={{ marginLeft: 'auto', background: '#f0fdf4', color: '#1D9E75', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>✓ {lang === 'fr' ? 'Actuel' : 'Current'}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(lang === 'fr' ? level.perks_fr : level.perks_en).map((perk, j) => (
                    <div key={j} style={{ fontSize: '12px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#1D9E75' }}>✓</span> {perk}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Comment gagner des points */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '14px' }}>
            💡 {lang === 'fr' ? 'Comment gagner des points ?' : 'How to earn points?'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { icon: '🗺️', action: lang === 'fr' ? 'Planifier un voyage' : 'Plan a trip', pts: '+100 pts', btn: lang === 'fr' ? 'Planifier' : 'Plan', path: '/' },
              { icon: '💬', action: lang === 'fr' ? 'Publier un avis' : 'Post a review', pts: '+50 pts', btn: lang === 'fr' ? 'Laisser un avis' : 'Post review', path: '/' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{item.action}</div>
                  <div style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '600' }}>{item.pts}</div>
                </div>
                <button onClick={() => navigate(item.path)} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}>
                  {item.btn}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/')} style={{ width: '100%', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>
          ← {lang === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
        </button>
      </div>
    </div>
  )
}