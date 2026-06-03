// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateTrip, getCities, getWeather } from '../services/api'

function Home({ setTripData }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    city: '',
    budget: 300,
    days: 3,
    type: 'culture'
  })

  const [cities, setCities]     = useState([])
  const [weather, setWeather]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  // Charger les villes au démarrage
  useEffect(() => {
    getCities()
      .then(res => setCities(res.data))
      .catch(err => console.error(err))
  }, [])

  // Charger la météo quand la ville change
  useEffect(() => {
    if (formData.city) {
      getWeather(formData.city)
        .then(res => setWeather(res.data))
        .catch(() => setWeather(null))
    }
  }, [formData.city])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await generateTrip(formData)
      setTripData(response.data)
      navigate('/result')
    } catch (err) {
      setError("Erreur lors de la génération du voyage. Vérifiez que le backend Flask tourne.")
    } finally {
      setLoading(false)
    }
  }

  const travelTypes = [
    { value: 'culture',   label: '🏛️ Culture',   desc: 'Musées, médinas, histoire' },
    { value: 'beach',     label: '🏖️ Plage',     desc: 'Mer, soleil, détente' },
    { value: 'relax',     label: '🌿 Relax',     desc: 'Promenade, café, nature' },
    { value: 'adventure', label: '🏕️ Aventure',  desc: 'Sport, randonnée, découverte' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          🗺️ TuniGuide <span className="text-green-600">AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Planifiez votre voyage en Tunisie avec l'intelligence artificielle.
          Itinéraires personnalisés, météo en temps réel, agent IA disponible 24h/24.
        </p>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Planifier mon voyage
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏙️ Ville de destination
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choisir une ville...</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Météo */}
              {weather && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <span>🌤️</span>
                  <span>{weather.temperature}°C — {weather.description}</span>
                  <span className="text-blue-600 ml-auto">{weather.advice}</span>
                </div>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💰 Budget total : <span className="text-green-600 font-bold">{formData.budget} DT</span>
              </label>
              <input
                type="range"
                name="budget"
                min="100"
                max="2000"
                step="50"
                value={formData.budget}
                onChange={handleChange}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>100 DT</span>
                <span>2000 DT</span>
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Durée : <span className="text-green-600 font-bold">{formData.days} jour{formData.days > 1 ? 's' : ''}</span>
              </label>
              <input
                type="range"
                name="days"
                min="1"
                max="10"
                step="1"
                value={formData.days}
                onChange={handleChange}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 jour</span>
                <span>10 jours</span>
              </div>
            </div>

            {/* Type de voyage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Type de voyage
              </label>
              <div className="grid grid-cols-2 gap-3">
                {travelTypes.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.value })}
                    className={`p-3 rounded-lg border-2 text-left transition ${
                      formData.type === t.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || !formData.city}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition text-lg"
            >
              {loading ? '⏳ Génération en cours...' : '🚀 Générer mon itinéraire'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Home