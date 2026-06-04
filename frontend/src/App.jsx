// src/App.jsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Result from './pages/Result'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import History from './pages/History'
import Rewards from './pages/Rewards'
import Destination from './pages/Destination'
import Booking from './pages/Booking'
import Search from './pages/Search'
import Profile from './pages/Profile'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  const [tripData, setTripData] = useState(null)

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <Navbar />
            <Routes>
              <Route path="/"          element={<Home setTripData={setTripData} />} />
              <Route path="/result"    element={<Result tripData={tripData} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/register"  element={<Register />} />
              <Route path="/history"   element={<History />} />
              <Route path="/rewards"   element={<Rewards />} />
              <Route path="/destination/:city" element={<Destination />} />
              <Route path="/booking/:type/:name/:city/:price" element={<Booking />} />
              <Route path="/search"    element={<Search />} />
              <Route path="/profile"   element={<Profile />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App