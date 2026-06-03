// src/pages/Result.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import MapComponent from '../components/MapComponent'
import ChatWidget from '../components/ChatWidget'

function Result({ tripData }) {
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(1)

  if (!tripData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg mb-4">Aucun voyage généré.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Planifier un voyage
        </button>
      </div>
    )
  }

  const { city, days, travel_type, budget, itinerary, recommended_restaurant, recommended_hotel, cost_summary, weather } = tripData

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            🗺️ Votre voyage à {city}
          </h1>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              📅 {days} jour{days > 1 ? 's' : ''}
            </span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              💰 Budget : {budget} DT
            </span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              🎯 {travel_type}
            </span>
            {weather && (
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                🌤️ {weather.temperature}°C — {weather.description}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">

        {/* Résumé budget */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">{cost_summary.activities} DT</div>
            <div className="text-sm text-gray-500">Activités</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{cost_summary.hotel} DT</div>
            <div className="text-sm text-gray-500">Hôtel</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-orange-500">{cost_summary.restaurant} DT</div>
            <div className="text-sm text-gray-500">Restaurant</div>
          </div>
          <div className={`rounded-xl p-4 shadow text-center ${cost_summary.remaining_budget >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-2xl font-bold ${cost_summary.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {cost_summary.remaining_budget} DT
            </div>
            <div className="text-sm text-gray-500">Restant</div>
          </div>
        </div>

        {/* Itinéraire */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Itinéraire jour par jour</h2>

          {/* Onglets jours */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {itinerary.map(item => (
              <button
                key={item.day}
                onClick={() => setActiveDay(item.day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeDay === item.day
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Jour {item.day}
              </button>
            ))}
          </div>

          {/* Détail du jour actif */}
          {itinerary.filter(item => item.day === activeDay).map(item => (
            <div key={item.day} className="border border-green-200 rounded-xl p-5 bg-green-50">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">{item.activity}</h3>
                <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full">
                  {item.cost === 0 ? 'Gratuit' : `${item.cost} DT`}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{item.description?.slice(0, 200)}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>⏱️ {item.duration_hours}h</span>
                <span>⭐ {item.rating}/5</span>
                <span>🎯 {item.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Restaurant + Hôtel */}
        <div className="grid md:grid-cols-2 gap-4">

          {recommended_restaurant && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">🍽️ Restaurant recommandé</h2>
              <div className="text-green-700 font-semibold">{recommended_restaurant.name}</div>
              <div className="text-sm text-gray-500 mt-1">{recommended_restaurant.cuisine}</div>
              <div className="text-sm text-gray-600 mt-2">
                💰 {recommended_restaurant.price_per_person} DT/personne
              </div>
              <div className="text-sm text-gray-600">⭐ {recommended_restaurant.rating}/5</div>
            </div>
          )}

          {recommended_hotel && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">🏨 Hôtel recommandé</h2>
              <div className="text-blue-700 font-semibold">{recommended_hotel.name}</div>
              <div className="text-sm text-gray-500 mt-1">{'⭐'.repeat(recommended_hotel.stars)}</div>
              <div className="text-sm text-gray-600 mt-2">
                💰 {recommended_hotel.price_per_night} DT/nuit
              </div>
              <div className="text-sm text-gray-600">⭐ {recommended_hotel.rating}/5</div>
            </div>
          )}
        </div>

        {/* Carte */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🗺️ Carte du voyage</h2>
          <MapComponent itinerary={itinerary} city={city} />
        </div>

        {/* Bouton retour */}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition"
        >
          ← Planifier un nouveau voyage
        </button>

      </div>

      {/* Chat Widget */}
      <ChatWidget tripData={tripData} />

    </div>
  )
}

export default Result