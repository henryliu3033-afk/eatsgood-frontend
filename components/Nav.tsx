'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, User, LogOut } from 'lucide-react'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import { Recommendation } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'

interface NavProps {
  onAuthOpen: () => void
  onRecommendOpen: () => void
  onSearchSelect: (item: Recommendation) => void
}

export default function Nav({ onAuthOpen, onRecommendOpen, onSearchSelect }: NavProps) {
  const { user, isLoggedIn, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(var(--bg-nav, 250,247,242),0.92)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-screen-xl mx-auto">
        {/* Logo */}
        <a href="/" className="text-2xl font-black tracking-tight select-none">
          <span style={{ color: 'var(--brand)' }}>EATS</span>
          <span style={{ color: 'var(--ink)' }}>GOOD</span>
        </a>

        {/* Center: Search */}
        <div className="flex-1 max-w-xs mx-4 hidden sm:block">
          <SearchBar onSelect={onSearchSelect} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <div className="sm:hidden">
            <SearchBar onSelect={onSearchSelect} />
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Recommend CTA */}
          <button
            onClick={onRecommendOpen}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 hover:brightness-110"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">推薦一道菜</span>
          </button>

          {/* 登入 / 用戶頭像 */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-9 h-9 rounded-full object-cover"
                style={{ outline: '2px solid var(--brand)', outlineOffset: '1px' }}
              />
              <button
                onClick={logout}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{ background: 'var(--surface)' }}
                title="登出"
              >
                <LogOut size={15} style={{ color: 'var(--ink2)' }} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthOpen}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'var(--surface)' }}
              title="登入"
            >
              <User size={17} style={{ color: 'var(--ink2)' }} />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
