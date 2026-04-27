'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import LevelRoadmap from '@/components/LevelRoadmap'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

type Tab = 'login' | 'register'

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { loginWithEmail, registerWithEmail, authError, clearAuthError } = useAuth()
  const [tab, setTab] = useState<Tab>('login')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginShowPw, setLoginShowPw] = useState(false)

  // Register fields
  const [regEmail, setRegEmail] = useState('')
  const [regName, setRegName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regShowPw, setRegShowPw] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setTab('login')
      setLoginEmail('')
      setLoginPassword('')
      setRegEmail('')
      setRegName('')
      setRegPassword('')
      setFieldError(null)
      clearAuthError()
    }
  }, [open, clearAuthError])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldError(null)
    if (!loginEmail || !loginPassword) {
      setFieldError('請填寫 Email 和密碼')
      return
    }
    setSubmitting(true)
    try {
      await loginWithEmail(loginEmail, loginPassword)
    } catch {
      // authError is set in context
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldError(null)
    if (!regEmail || !regName || !regPassword) {
      setFieldError('請填寫所有欄位')
      return
    }
    if (regPassword.length < 8) {
      setFieldError('密碼至少 8 個字元')
      return
    }
    setSubmitting(true)
    try {
      await registerWithEmail(regEmail, regName, regPassword)
    } catch {
      // authError is set in context
    } finally {
      setSubmitting(false)
    }
  }

  const displayError = fieldError || authError

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            style={{ background: 'var(--card)' }}
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              <X size={15} style={{ color: 'var(--ink2)' }} />
            </button>

            {/* Logo */}
            <div className="text-center mb-6">
              <div className="text-2xl font-black tracking-tight mb-1">
                <span style={{ color: 'var(--brand)' }}>EATS</span>
                <span style={{ color: 'var(--ink)' }}>GOOD</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--ink3)' }}>
                登入後才能推薦必吃品項
              </p>
            </div>

            {/* OAuth buttons (coming soon) */}
            <div className="space-y-2 mb-5">
              <button
                disabled
                className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl font-medium text-sm opacity-40 cursor-not-allowed"
                style={{ background: 'var(--card)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="flex-1 text-left">用 Google 帳號登入</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface)', color: 'var(--ink3)' }}>即將推出</span>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl font-medium text-sm opacity-40 cursor-not-allowed"
                style={{ background: '#06C755', color: '#fff' }}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.26 2 11.5c0 2.86 1.3 5.42 3.35 7.17-.15.52-.97 3.33-.97 3.33s3.1-1.64 3.67-1.95c1.27.35 2.6.55 3.95.55 5.52 0 10-4.26 10-9.5S17.52 2 12 2z" />
                </svg>
                <span className="flex-1 text-left">用 LINE 帳號登入</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">即將推出</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--ink3)' }}>或用 Email</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl p-1 mb-5" style={{ background: 'var(--surface)' }}>
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setFieldError(null); clearAuthError() }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: tab === t ? 'var(--card)' : 'transparent',
                    color: tab === t ? 'var(--ink)' : 'var(--ink3)',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {t === 'login' ? '登入' : '註冊'}
                </button>
              ))}
            </div>

            {/* Error */}
            <AnimatePresence>
              {displayError && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-center mb-3 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                >
                  {displayError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Login form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                />
                <div className="relative">
                  <input
                    type={loginShowPw ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="密碼"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
                    style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setLoginShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--ink3)' }}
                  >
                    {loginShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: 'var(--brand)', color: '#fff' }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  登入
                </button>
              </form>
            )}

            {/* Register form */}
            {tab === 'register' && (
              <div>
                <form onSubmit={handleRegister} className="space-y-3">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                  />
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="顯示名稱（例如：林小雨）"
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                  />
                  <div className="relative">
                    <input
                      type={regShowPw ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="密碼（至少 8 個字元）"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
                      style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--ink3)' }}
                    >
                      {regShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{ background: 'var(--brand)', color: '#fff' }}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    建立帳號
                  </button>
                </form>

                {/* 升級路線圖 */}
                <LevelRoadmap />
              </div>
            )}

            <p className="text-xs text-center mt-5" style={{ color: 'var(--ink3)' }}>
              登入即代表同意 EATSGOOD 的
              <span style={{ color: 'var(--brand)' }}> 服務條款 </span>與
              <span style={{ color: 'var(--brand)' }}> 隱私政策</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
