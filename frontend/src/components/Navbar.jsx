import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🗺️</span>
        <span className="text-xl font-bold text-green-600">TuniGuide</span>
        <span className="text-xl font-bold text-gray-700">AI</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition">
          Accueil
        </Link>
        <Link to="/result" className="text-gray-600 hover:text-green-600 font-medium transition">
          Mon Voyage
        </Link>
        <a href="https://github.com/adamkas0987/tuniguide-ai" target="_blank" rel="noreferrer" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium">
          GitHub
        </a>
      </div>
    </nav>
  )
}

export default Navbar