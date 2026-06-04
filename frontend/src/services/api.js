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

// Lieux par ville
export const getPlaces = (city) => API.get(`/places${city ? `?city=${city}` : ''}`)

// Restaurants par ville
export const getRestaurants = (city) => API.get(`/restaurants${city ? `?city=${city}` : ''}`)

// Hotels par ville
export const getHotels = (city) => API.get(`/hotels${city ? `?city=${city}` : ''}`)

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

// Avis — récupérer
export const getReviews = (city) => API.get(`/reviews${city ? `?city=${city}` : ''}`)

// Avis — poster
export const postReview = (data) => API.post('/reviews', data)

// Récompenses
export const getRewardsPoints = (token) => axios.get(
  'https://tuniguide-backend.onrender.com/rewards/points',
  { headers: { Authorization: `Bearer ${token}` } }
)

// Destination complète
export const getDestination = (city) => API.get(`/destination/${city}`)

// Réservations
export const createBooking = (data) => API.post('/bookings', data)
export const getBookings = () => API.get('/bookings')

// Image d'un lieu
export const getPlaceImage = (placeName) => API.get(`/image/${encodeURIComponent(placeName)}`)

// Notation
export const addRating = (data) => API.post('/ratings', data)
export const getRatings = (placeName) => API.get(`/ratings/${encodeURIComponent(placeName)}`)