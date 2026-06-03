// src/services/api.js
import axios from 'axios'

const API = axios.create({
  baseURL: 'https://tuniguide-backend.onrender.com',
  headers: { 'Content-Type': 'application/json' }
})

// Générer un voyage
export const generateTrip = (data) => API.post('/generate-trip', data)

// Liste des villes
export const getCities = () => API.get('/cities')

// Météo d'une ville
export const getWeather = (city) => API.get(`/weather/${city}`)

// Chat avec l'agent IA
export const chatWithAgent = (message, history, tripContext) =>
  API.post('/chat', {
    message,
    history,
    trip_context: tripContext
  })

// Alternative si lieu fermé
export const getAlternative = (city, type, exclude, lat, lng) =>
  API.post('/alternative', { city, type, exclude, lat, lng })