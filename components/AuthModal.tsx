'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

const MOCK_USERS = [
  { id: 'u_google', display_name: '林小雨', avatar_url: 'https://i.pravatar.cc/40?img=47' },
  { id: 'u_line',   display_name: '陳小明', avatar_url: 'https://i.pravatar.cc/40?img=12' },
  { id: 'u_email',  display_name: '王美食', avatar_url: 'https://i.pravatar.cc/40?img=32' },
]

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login } = useAuth()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />

          <motion.div
            className="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            style={{ background: 'var(--card)' }}
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface)' }}>
              <X size={15} style={{ color: 'var(--ink2)' }} />
            </button>

            {/* Logo */}
            <div className="text-center mb-6">
              <div className="text-2xl font-black tracking-tight mb-1">
                <span style={{ color: 'var(--brand)' }}>EATS</span>
                <span style={{ color: 'var(--ink)' }}>GOOD</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--ink3)' }}>登入後才能推薦必吃品項</p>
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3">
              <button
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium text-sm transition-all active:scale-95 hover:brightness-95"
                style={{ background: 'var(--card)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                onClick={() => login(MOCK_USERS[0])}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                用 Google 帳號登入
              </button>

              <button
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium text-sm transition-all active:scale-95"
                style={{ background: '#06C755', color: '#fff' }}
                onClick={() => login(MOCK_USERS[1])}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.26 2 11.5c0 2.86 1.3 5.42 3.35 7.17-.15.52-.97 3.33-.97 3.33s3.1-1.64 3.67-1.95c1.27.35 2.6.55 3.95.55 5.52 0 10-4.26 10-9.5S17.52 2 12 2z"/>
                </svg>
                用 LINE 帳號登入
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--ink3)' }}>或</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <button
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium text-sm transition-all active:scale-95"
                style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                onClick={() => login(MOCK_USERS[2])}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                用 Email 登入 / 註冊
              </button>
            </div>

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
