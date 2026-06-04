// src/components/PlaceImage.jsx
import { useState } from 'react'

const CITY_IMAGES = {
  'Medina': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/2009-06-15_Sousse_Medina.jpg/400px-2009-06-15_Sousse_Medina.jpg',
  'Tunis':  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Tunis_medina_overview.jpg/400px-Tunis_medina_overview.jpg',
  'Bardo':  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Bardo_National_Museum.jpg/400px-Bardo_National_Museum.jpg',
  'Kairouan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Great_Mosque_of_Kairouan_court.jpg/400px-Great_Mosque_of_Kairouan_court.jpg',
  'El Jem': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/ElDjemColosseum.jpg/400px-ElDjemColosseum.jpg',
  'Djerba': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Djerba_Tunisia.jpg/400px-Djerba_Tunisia.jpg',
  'Sidi Bou': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sidi_Bou_Said_1.jpg/400px-Sidi_Bou_Said_1.jpg',
  'Ribat':  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ribat_of_Sousse.jpg/400px-Ribat_of_Sousse.jpg',
  'Mosque': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mosque_Uqba.jpg/400px-Mosque_Uqba.jpg',
  'Museum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Bardo_National_Museum.jpg/400px-Bardo_National_Museum.jpg',
  'Beach':  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Hammamet_beach.jpg/400px-Hammamet_beach.jpg',
  'Port':   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Port_El_Kantaoui.jpg/400px-Port_El_Kantaoui.jpg',
}

const TYPE_FALLBACKS = {
  culture:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/2009-06-15_Sousse_Medina.jpg/400px-2009-06-15_Sousse_Medina.jpg',
  beach:     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Hammamet_beach.jpg/400px-Hammamet_beach.jpg',
  relax:     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sidi_Bou_Said_1.jpg/400px-Sidi_Bou_Said_1.jpg',
  adventure: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/ElDjemColosseum.jpg/400px-ElDjemColosseum.jpg',
  default:   'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Tunis_medina_overview.jpg/400px-Tunis_medina_overview.jpg',
}

function getImageForPlace(name, type) {
  if (!name) return TYPE_FALLBACKS[type] || TYPE_FALLBACKS.default
  const nameLower = name.toLowerCase()
  for (const [key, url] of Object.entries(CITY_IMAGES)) {
    if (nameLower.includes(key.toLowerCase())) return url
  }
  return TYPE_FALLBACKS[type] || TYPE_FALLBACKS.default
}

export default function PlaceImage({ name, type, style = {} }) {
  const [error, setError] = useState(false)
  const src = getImageForPlace(name, type)
  const fallback = TYPE_FALLBACKS[type] || TYPE_FALLBACKS.default

  return (
    <img
      src={error ? fallback : src}
      alt={name || 'lieu'}
      onError={() => setError(true)}
      style={{ objectFit: 'cover', ...style }}
    />
  )
}