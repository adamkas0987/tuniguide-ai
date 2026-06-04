// src/components/PlaceImage.jsx
import { useState } from 'react'

const PLACE_IMAGES = {
  'medina':       'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'mosque':       'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80',
  'museum':       'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400&q=80',
  'amphitheatre': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
  'beach':        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  'port':         'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
  'jardin':       'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80',
  'garden':       'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80',
  'synagogue':    'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&q=80',
  'cemetery':     'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&q=80',
  'ribat':        'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'kasbah':       'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'bardo':        'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400&q=80',
  'sousse':       'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'tunis':        'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'djerba':       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  'kairouan':     'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80',
  'sfax':         'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'el jem':       'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
  'sidi bou':     'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'treasury':     'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400&q=80',
  'currency':     'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400&q=80',
  'bab':          'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  'kobba':        'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400&q=80',
  'lake':         'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
  'lac':          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
  'plage':        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  'hotel':        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
  'restaurant':   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  'cafe':         'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
}

const TYPE_FALLBACKS = {
  culture:   'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
  beach:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  relax:     'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
  adventure: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
  default:   'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
}

function getImage(name, type) {
  if (!name) return TYPE_FALLBACKS[type] || TYPE_FALLBACKS.default
  const lower = name.toLowerCase()
  const entries = Object.entries(PLACE_IMAGES)
  for (const [key, url] of entries) {
    if (lower.includes(key)) return url
  }
  return TYPE_FALLBACKS[type] || TYPE_FALLBACKS.default
}

export default function PlaceImage({ name, type, style = {} }) {
  const [error, setError] = useState(false)
  const src = getImage(name, type)
  const fallback = TYPE_FALLBACKS[type] || TYPE_FALLBACKS.default

  return (
    <img
      src={error ? fallback : src}
      alt={name || 'lieu'}
      onError={() => setError(true)}
      style={{ objectFit: 'cover', ...style }}
      loading="lazy"
    />
  )
}