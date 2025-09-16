'use client'

import { useState, useEffect } from 'react'
import { LoginPage } from './LoginPage'
import { Dashboard } from './Dashboard'

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing auth token in localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      setAuthToken(token)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (token: string) => {
    localStorage.setItem('auth_token', token)
    setAuthToken(token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setAuthToken(null)
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard />
}
