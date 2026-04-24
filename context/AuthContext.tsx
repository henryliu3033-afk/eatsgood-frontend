'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthUser {
  id: string
  display_name: string
  avatar_url: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  openAuthModal: () => void
  login: (user: AuthUser) => void
  logout: () => void
  authModalOpen: boolean
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const openAuthModal = () => setAuthModalOpen(true)
  const closeAuthModal = () => setAuthModalOpen(false)

  const login = (user: AuthUser) => {
    setUser(user)
    setAuthModalOpen(false)
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      openAuthModal,
      login,
      logout,
      authModalOpen,
      closeAuthModal,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
