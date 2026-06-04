// src/components/TunisiaMap.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const REGIONS = [
  { name: 'Tunis',    x: 185, y: 95,  emoji: '🕌', color: '#1D9E75', places: 20, desc: 'Capitale, médinas, musées' },
  { name: 'Sousse',  x: 195, y: 175, emoji: '🏖️', color: '#0284c7', places: 20, desc: 'Plages, ribat, médina' },
  { name: 'Sfax',    x: 185, y: 240, emoji: '🏺', color: '#7c3aed', places: 20, desc: 'Médina authentique' },
  { name: 'Kairouan',x: 155, y: 190, emoji: '🕍', color: '#b45309', places: 20, desc: '4ème ville sainte Islam' },
  { name: 'Djerba',  x: 185, y: 310, emoji: '🌊', color: '#0891b2', places: 12, desc: 'Île paradisiaque' },
  { name: 'El Jem',  x: 190, y: 215, emoji: '🏛️', color: '#b45309', places: 4,  desc: 'Amphithéâtre romain' },
]

export default function TunisiaMap({ lang = 'fr' }) {
  const navigate  = useNavigate()
  const [hovered, setHovered] = useState(null)
  const [active, setActive]   = useState(null)

  const handleClick = (region) => {
    setActive(region.name)
    setTimeout(() => navigate(`/destination/${region.name}`), 300)
  }

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '0.5px solid #e5e7eb' }}>
      <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
        🗺️ {lang === 'fr' ? 'Carte interactive de la Tunisie' : 'Interactive Map of Tunisia'}
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        {lang === 'fr' ? 'Cliquez sur une ville pour explorer' : 'Click on a city to explore'}
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* SVG Map */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="280" height="380" viewBox="0 0 280 380" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>
            {/* Tunisie shape simplifié */}
            <path d="M 120 20 L 200 15 L 230 40 L 240 70 L 220 100 L 230 130 L 210 160 L 220 190 L 210 220 L 220 260 L 200 290 L 190 320 L 170 340 L 150 330 L 140 300 L 130 270 L 120 250 L 100 240 L 80 220 L 70 190 L 80 160 L 70 130 L 80 100 L 90 70 L 100 45 Z"
              fill="#e8f5e9" stroke="#1D9E75" strokeWidth="2" />

            {/* Mer méditerranée */}
            <text x="30" y="60" fontSize="9" fill="#93c5fd" fontWeight="500">Méditerranée</text>
            <text x="220" y="180" fontSize="9" fill="#93c5fd" fontWeight="500">Mer</text>
            <text x="218" y="190" fontSize="9" fill="#93c5fd" fontWeight="500">Rouge</text>

            {/* Sahara */}
            <text x="95" y="350" fontSize="9" fill="#d97706" fontWeight="500">Sahara</text>

            {/* Points des villes */}
            {REGIONS.map(region => {
              const isHovered = hovered === region.name
              const isActive  = active === region.name
              return (
                <g key={region.name}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleClick(region)}
                  onMouseEnter={() => setHovered(region.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Cercle pulsant */}
                  {isHovered && (
                    <circle cx={region.x} cy={region.y} r="20" fill={region.color} opacity="0.15" />
                  )}
                  {/* Point principal */}
                  <circle
                    cx={region.x} cy={region.y}
                    r={isHovered || isActive ? 10 : 7}
                    fill={isActive ? '#4ade80' : region.color}
                    stroke="white"
                    strokeWidth="2"
                    style={{ transition: 'all 0.2s' }}
                  />
                  {/* Emoji */}
                  <text x={region.x} y={region.y - 15} textAnchor="middle" fontSize="14">
                    {region.emoji}
                  </text>
                  {/* Nom ville */}
                  <text
                    x={region.x + 14} y={region.y + 4}
                    fontSize="11" fontWeight="600"
                    fill={isHovered ? region.color : '#374151'}
                    style={{ transition: 'fill 0.2s' }}
                  >
                    {region.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Légende et info */}
        <div style={{ flex: 1 }}>
          {/* Info ville survolée */}
          {hovered && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '12px', padding: '14px', marginBottom: '14px',
              transition: 'all 0.2s'
            }}>
              {REGIONS.filter(r => r.name === hovered).map(r => (
                <div key={r.name}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D9E75', marginBottom: '4px' }}>
                    {r.emoji} {r.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '8px' }}>{r.desc}</div>
                  <div style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '500' }}>
                    📍 {r.places} lieux disponibles
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Liste des villes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {REGIONS.map(region => (
              <div key={region.name}
                onClick={() => handleClick(region)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                  background: hovered === region.name ? '#f0fdf4' : '#f9fafb',
                  border: `1px solid ${hovered === region.name ? '#bbf7d0' : '#e5e7eb'}`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={() => setHovered(region.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <span style={{ fontSize: '18px' }}>{region.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{region.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{region.places} lieux</div>
                </div>
                <span style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '500' }}>Explorer →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}