// src/App.jsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Result from './pages/Result'

function App() {
  const [tripData, setTripData] = useState(null)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home setTripData={setTripData} />} />
          <Route path="/result" element={<Result tripData={tripData} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App