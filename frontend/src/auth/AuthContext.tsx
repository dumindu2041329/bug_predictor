import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../api'
import { UNAUTHORIZED_EVENT } from '../api'
import type { AuthResponse, User } from '../types'

type AuthStatus = 'loading' | 'authed' | 'anon'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (api.getToken() ? 'loading' : 'anon'))

  useEffect(() => {
    // Restore the session from a stored token
    if (api.getToken()) {
      api
        .fetchMe()
        .then((me) => {
          setUser(me)
          setStatus('authed')
        })
        .catch(() => {
          api.setToken(null)
          setStatus('anon')
        })
    }

    // Any protected API call that comes back 401 signs the user out
    const onUnauthorized = () => {
      api.setToken(null)
      setUser(null)
      setStatus('anon')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const adopt = (data: AuthResponse) => {
    api.setToken(data.token)
    setUser(data.user)
    setStatus('authed')
  }

  const value: AuthContextValue = {
    user,
    status,
    signIn: async (email, password) => adopt(await api.login(email, password)),
    signUp: async (name, email, password) => adopt(await api.register(name, email, password)),
    signOut: () => {
      api.setToken(null)
      setUser(null)
      setStatus('anon')
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
