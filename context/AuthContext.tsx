'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import {
  apiGetMe,
  apiLogin,
  apiRegister,
  apiLogout,
  setToken,
  getToken,
  clearToken,
  UserOut,
  ApiError,
} from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthUser = UserOut

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  isLoading: boolean
  authError: string | null
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, displayName: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearAuthError: () => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Rehydrate on mount: if token exists, fetch /users/me
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    apiGetMe()
      .then(setUser)
      .catch(() => {
        // Token is expired or invalid
        clearToken()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const openAuthModal = useCallback(() => {
    setAuthError(null)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
    setAuthError(null)
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null)
    try {
      const { access_token } = await apiLogin(email, password)
      setToken(access_token)
      const me = await apiGetMe()
      setUser(me)
      setAuthModalOpen(false)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '登入失敗，請稍後再試'
      setAuthError(msg)
      throw err
    }
  }, [])

  const registerWithEmail = useCallback(
    async (email: string, displayName: string, password: string) => {
      setAuthError(null)
      try {
        const { access_token } = await apiRegister(email, displayName, password)
        setToken(access_token)
        const me = await apiGetMe()
        setUser(me)
        setAuthModalOpen(false)
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : '註冊失敗，請稍後再試'
        setAuthError(msg)
        throw err
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore — token might be gone already
    } finally {
      clearToken()
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        authError,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
