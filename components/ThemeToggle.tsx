'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      style={{ background: 'var(--surface)' }}
      whileTap={{ scale: 0.9 }}
      title={isDark ? '切換淺色模式' : '切換深色模式'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0,   opacity: 1, scale: 1 }}
        exit={{    rotate:  30, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
      >
        {isDark
          ? <Sun  size={16} style={{ color: 'var(--brand-500)' }} />
          : <Moon size={16} style={{ color: 'var(--ink2)' }} />
        }
      </motion.div>
    </motion.button>
  )
}
