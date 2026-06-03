// src/components/MapComponent.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Coordonnées par défaut des villes
const CITY_COORDS = {
  'Tunis':    [36.8065, 10.1815],
  'Sousse':   [35.8256, 10.6369],
  'Sfax':     [34.7406, 10.7603],
  'Djerba':   [33.8076, 10.8451],
  'Kairouan': [35.6781, 10.0963],
  'El Jem':   [35.2963, 10.7072],
}

function MapComponent({ itinerary, city }) {
  const center = CITY_COORDS[city] || [34.0, 9.0]

  // Filtrer les lieux avec coordonnées valides
  const validPlaces = itinerary.filter(
    item => item.lat && item.lng &&
    !isNaN(item.lat) && !isNaN(item.lng)
  )

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap'
      />

      {validPlaces.map((item) => (
        <Marker
          key={item.day}
          position={[item.lat, item.lng]}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-bold text-green-700">
                Jour {item.day} — {item.activity}
              </div>
              <div className="text-gray-600 mt-1">
                {item.description?.slice(0, 100)}
              </div>
              <div className="mt-1 text-gray-500">
                💰 {item.cost === 0 ? 'Gratuit' : `${item.cost} DT`} |
                ⭐ {item.rating}/5
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapComponent