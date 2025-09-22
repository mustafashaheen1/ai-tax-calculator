'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)
    } catch (error: any) {
      console.error('Sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else {
        setError('Failed to sign in')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
    } catch (error: any) {
      console.error('Sign-out error:', error)
      setError('Failed to sign out')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}