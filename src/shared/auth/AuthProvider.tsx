import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { authStorage } from './authStorage'
import type { AuthSession, AuthUser } from '../types/content'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = authStorage.read()
    if (!session) {
      setLoading(false)
      return
    }

    apiClient
      .me(session.token)
      .then((response) => {
        setUser(response.user)
        setToken(session.token)
        authStorage.write({ token: session.token, user: response.user })
      })
      .catch(() => {
        authStorage.clear()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const persistSession = (session: AuthSession) => {
    setUser(session.user)
    setToken(session.token)
    authStorage.write(session)
  }

  const value: AuthContextValue = {
    user,
    token,
    loading,
    async login(username, password) {
      const session = await apiClient.login(username, password)
      persistSession(session)
    },
    async loginWithGoogle(credential) {
      const session = await apiClient.loginWithGoogle(credential)
      persistSession(session)
    },
    logout() {
      setUser(null)
      setToken(null)
      authStorage.clear()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}