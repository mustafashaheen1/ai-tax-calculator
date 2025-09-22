'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
    if (!auth) {
      console.error('Firebase auth not initialized')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    }, (error) => {
      console.error('Auth state change error:', error)
      setError(error.message)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      setError('Authentication not initialized')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)
    } catch (error: any) {
      console.error('Sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups and try again.')
      } else {
        setError(error.message || 'Failed to sign in with Google')
      }
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      setError('Authentication not initialized')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      setUser(result.user)
    } catch (error: any) {
      console.error('Email sign-in error:', error)
      setError(error.message || 'Failed to sign in with email')
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    if (!auth) {
      setError('Authentication not initialized')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      setUser(result.user)
    } catch (error: any) {
      console.error('Email sign-up error:', error)
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (!auth) {
      setError('Authentication not initialized')
      return
    }

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
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}