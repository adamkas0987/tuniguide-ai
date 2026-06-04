// src/components/PlaceImage.jsx
import { useState, useEffect } from 'react'
import { getPlaceImage } from '../services/api.js'

const FALLBACK_IMAGES = {
  culture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Medina_of_Tunis.jpg/320px-Medina_of_Tunis.jpg',
  beach:   'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Djerba_beach.jpg/320px-Djerba_beach.jpg',
  relax:   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sidi_Bou_Said_1.jpg/320px-Sidi_Bou_Said_1.jpg',
  default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/2009-06-15_Sousse_Medina.jpg/320px-2009-06-15_Sousse_Medina.jpg'
}

export default function PlaceImage({ name, type, style = {}, className = '' }) {
  const [src, setSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!name) return
    getPlaceImage(name)
      .then(res => {
        if (res.data.image) {
          setSrc(res.data.image)
        } else {
          setSrc(FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default)
        }
      })
      .catch(() => setSrc(FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default))
      .finally(() => setLoading(false))
  }, [name])

  if (loading) return (
    <div style={{
      background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style
    }}>
      <div style={{ fontSize: '24px', opacity: 0.5 }}>
        {type === 'beach' ? '🏖️' : type === 'relax' ? '🌿' : '🏛️'}
      </div>
    </div>
  )

  return (
    <img
      src={error ? (FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default) : src}
      alt={name}
      onError={() => setError(true)}
      style={{ objectFit: 'cover', ...style }}
    />
  )
}