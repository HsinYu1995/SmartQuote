import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

type Mode = 'login' | 'register'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [agency, setAgency] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({ name, email, password, licenseNumber, agency })
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">SQ</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SmartQuote</h1>
          <p className="text-gray-500 text-sm mt-1">Broker Portal</p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          {mode === 'register' && (
            <>
              <Input
                label="Full name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
                autoComplete="name"
              />
              <Input
                label="License number"
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="LIC-2024-00123"
                required
              />
              <Input
                label="Agency"
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder="SmartQuote Insurance Group"
                required
              />
            </>
          )}

          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="broker@agency.com"
            required
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            data-testid="password-input"
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" data-testid="login-error">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full" data-testid="login-submit">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {mode === 'login' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-gray-600">Email: <code className="bg-gray-200 px-1 rounded">alex.johnson@smartquote.com</code></p>
            <p className="text-xs text-gray-600">Password: <code className="bg-gray-200 px-1 rounded">demo1234</code></p>
          </div>
        )}
      </div>
    </div>
  )
}
