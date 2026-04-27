'use client'

/**
 * LevelRoadmap — 升級路線圖（用於 AuthModal 註冊頁）
 * 展示 4 個等級的晉升路線，讓新用戶一眼看懂平台規則
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { LEVEL_DEFS } from '@/lib/levelSystem'

export default function LevelRoadmap() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden mt-4"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          {/* Mini level pills */}
          <div className="flex items-center gap-1">
            {LEVEL_DEFS.map((def, i) => (
              <span key={def.level} className="flex items-center gap-0.5">
                <span className="text-sm">{def.emoji}</span>
                {i < LEVEL_DEFS.length - 1 && (
                  <span style={{ color: 'var(--ink3)', fontSize: 10 }}>→</span>
                )}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--ink2)' }}>
            升級路線圖
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: 'var(--ink3)' }} />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="roadmap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-4 pb-4 pt-1 space-y-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <p className="text-xs pt-2" style={{ color: 'var(--ink3)' }}>
                推薦越多、獲得越多認可，你的每一票影響力越大。
              </p>

              {/* Level cards */}
              {LEVEL_DEFS.map((def, idx) => (
                <div
                  key={def.level}
                  className="rounded-xl p-3"
                  style={{
                    background: def.bgColor,
                    border: `1px solid ${def.borderColor}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{def.emoji}</span>
                      <span className="text-sm font-semibold" style={{ color: def.color }}>
                        {def.level}
                      </span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: def.borderColor, color: def.color }}
                    >
                      推薦權重 ×{def.trustWeight}
                    </span>
                  </div>

                  <p className="text-xs mb-2" style={{ color: 'var(--ink3)' }}>
                    {def.tagline}
                  </p>

                  {idx === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--ink3)' }}>
                      ✅ 完成註冊後自動獲得
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {def.requirements.map(req => (
                        <div key={req.key} className="flex items-center gap-1.5">
                          <span className="text-xs">{req.icon}</span>
                          <span className="text-xs" style={{ color: 'var(--ink2)' }}>
                            {req.label}
                            {req.target !== null && (
                              <span style={{ color: 'var(--ink3)' }}>
                                {' '}≥ {req.target} {req.unit}
                              </span>
                            )}
                            {req.comingSoon && (
                              <span
                                className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: 'var(--surface)',
                                  color: 'var(--ink3)',
                                  fontSize: 10,
                                }}
                              >
                                即將推出
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <p className="text-xs text-center pt-1" style={{ color: 'var(--ink3)' }}>
                等級越高，你的推薦對「全城熱議」觸發的貢獻越大 🔥
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
