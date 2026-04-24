'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Utensils } from 'lucide-react'
import { MOCK_RECOMMENDATIONS } from '@/lib/mockData'
import { Recommendation } from '@/lib/types'

interface SearchBarProps {
  onSelect?: (item: Recommendation) => void
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.trim().length > 0
    ? MOCK_RECOMMENDATIONS.filter(r =>
        r.restaurant.name.includes(query) ||
        (r.menu_item?.name ?? '').includes(query) ||
        r.tags.some(t => t.includes(query)) ||
        r.restaurant.district.includes(query)
      ).slice(0, 6)
    : MOCK_RECOMMENDATIONS.slice(0, 4)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleSelect = (item: Recommendation) => {
    setQuery('')
    setOpen(false)
    onSelect?.(item)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
        style={{ background: 'var(--surface)', color: 'var(--ink2)' }}
      >
        <Search size={15} />
        <span className="text-sm hidden sm:block">搜尋餐廳或品項…</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="mx-4 mt-20 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--card)', maxWidth: 560, alignSelf: 'center', width: '100%' }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <Search size={18} style={{ color: 'var(--brand)' }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="搜尋餐廳、品項、地區…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--ink)' }}
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X size={16} style={{ color: 'var(--ink3)' }} />
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: 'var(--surface)', color: 'var(--ink2)' }}>
                  取消
                </button>
              </div>

              {/* Results */}
              <div className="py-2 max-h-80 overflow-y-auto">
                {!query && (
                  <p className="text-xs px-4 py-2 font-medium" style={{ color: 'var(--ink3)' }}>熱門推薦</p>
                )}
                {results.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm" style={{ color: 'var(--ink3)' }}>找不到「{query}」的結果</p>
                  </div>
                ) : (
                  results.map(item => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => handleSelect(item)}
                    >
                      <img src={item.image_urls[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>
                          {item.menu_item?.name ?? item.restaurant.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} style={{ color: 'var(--ink3)' }} />
                          <p className="text-xs truncate" style={{ color: 'var(--ink3)' }}>
                            {item.restaurant.name} · {item.restaurant.district}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Utensils size={11} style={{ color: 'var(--brand)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--brand)' }}>
                          {item.me_too_count}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
