// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = 'http://127.0.0.1:5000'

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data))
      .catch(() => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
      })
    }
  }, [token])

  const login = async (email, password) => {
    const res = await axios.post(`${API}/login`, { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    localStorage.setItem('token', res.data.token)
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/register`, { name, email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    localStorage.setItem('token', res.data.token)
    return res.data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const saveTrip = async (tripData) => {
    if (!token) return null
    const res = await axios.post(`${API}/trips/save`, tripData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }

  const getHistory = async () => {
    if (!token) return []
    const res = await axios.get(`${API}/trips/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, saveTrip, getHistory }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}