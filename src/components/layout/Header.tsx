import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function Header() {
  const { broker, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SQ</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">SmartQuote</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/quotes/new" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              New Quote
            </Link>
            <Link to="/quotes" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Quote History
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{broker?.name}</p>
              <p className="text-xs text-gray-500">{broker?.agency}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">
                {broker?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              data-testid="logout-button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
