// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { getCities } from '../services/api'
import axios from 'axios'

const API = 'http://127.0.0.1:5000'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

function Dashboard() {
  const [cities, setCities]             = useState([])
  const [placesData, setPlacesData]     = useState([])
  const [typeData, setTypeData]         = useState([])
  const [weatherData, setWeatherData]   = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger les villes
      const citiesRes = await getCities()
      const cityList = citiesRes.data
      setCities(cityList)

      // Charger les lieux par ville
      const placesPromises = cityList.map(city =>
        axios.get(`${API}/places?city=${city}`)
          .then(res => ({ city, count: res.data.length }))
          .catch(() => ({ city, count: 0 }))
      )
      const placesResults = await Promise.all(placesPromises)
      setPlacesData(placesResults)

      // Calculer les types de lieux
      const allPlacesRes = await axios.get(`${API}/places`)
      const allPlaces = allPlacesRes.data
      const typeCounts = {}
      allPlaces.forEach(p => {
        const t = p.type || 'autre'
        typeCounts[t] = (typeCounts[t] || 0) + 1
      })
      setTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name, value })))

      // Charger la météo de chaque ville
      const weatherPromises = cityList.map(city =>
        axios.get(`${API}/weather/${city}`)
          .then(res => ({
            city,
            temp: res.data.temperature,
            humidity: res.data.humidity
          }))
          .catch(() => ({ city, temp: 0, humidity: 0 }))
      )
      const weatherResults = await Promise.all(weatherPromises)
      setWeatherData(weatherResults)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        ⏳ Chargement des données...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          📊 Dashboard Analytics
        </h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Statistiques en temps réel de TuniGuide AI
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Villes', value: cities.length, icon: '🏙️', color: '#16a34a' },
          { label: 'Lieux touristiques', value: placesData.reduce((a, b) => a + b.count, 0), icon: '🗺️', color: '#2563eb' },
          { label: 'Types de lieux', value: typeData.length, icon: '🎯', color: '#d97706' },
          { label: 'Données météo', value: weatherData.length, icon: '🌤️', color: '#7c3aed' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '24px'
      }}>

        {/* Lieux par ville */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            🏙️ Lieux touristiques par ville
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={placesData}>
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Types de lieux */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            🎯 Répartition par type
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {typeData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Météo */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          🌡️ Températures actuelles par ville
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weatherData}>
            <XAxis dataKey="city" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="°C" />
            <Tooltip formatter={(value) => [`${value}°C`, 'Température']} />
            <Bar dataKey="temp" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bouton refresh */}
      <button
        onClick={loadData}
        style={{
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        🔄 Actualiser les données
      </button>

    </div>
  )
}

export default Dashboard