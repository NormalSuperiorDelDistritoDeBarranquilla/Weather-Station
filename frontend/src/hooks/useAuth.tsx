import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { authService } from '../services/authService'
import type { LoginPayload, User } from '../types/api'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await authService.me()
      setUser(response.user)
      return response.user
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload)
    setUser(response.user)
    return response.user
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  useEffect(() => {
    void refreshUser()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }

  return context
}
