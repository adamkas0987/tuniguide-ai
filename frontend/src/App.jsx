import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Result from './pages/Result'
import Dashboard from './pages/Dashboard'

function App() {
  const [tripData, setTripData] = useState(null)

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home setTripData={setTripData} />} />
          <Route path="/result" element={<Result tripData={tripData} />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App