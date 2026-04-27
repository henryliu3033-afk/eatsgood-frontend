'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Utensils, Loader2 } from 'lucide-react'
import { apiSearchFeed } from '@/lib/api'
import { adaptRecommendationOut } from '@/lib/adapters'
import { Recommendation } from '@/lib/types'

interface SearchBarProps {
  onSelect?: (item: Recommendation) => void
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setQuery('')
      setResults([])
      setSearched(false)
    }
  }, [open])

  // Debounce 300ms
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      setSearched(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const raw = await apiSearchFeed(trimmed, 8)
        setResults(raw.map(adaptRecommendationOut))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
        setSearched(true)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback((item: Recommendation) => {
    setQuery('')
    setOpen(false)
    onSelect?.(item)
  }, [onSelect])

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResults([])
  }, [])

  const getThumb = (item: Recommendation) =>
    item.image_urls?.[0] || item.menu_item?.image_url || null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:brightness-95 active:scale-95"
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
            onClick={handleClose}
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
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                {loading
                  ? <Loader2 size={18} className="animate-spin flex-shrink-0" style={{ color: 'var(--brand)' }} />
                  : <Search size={18} className="flex-shrink-0" style={{ color: 'var(--brand)' }} />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="搜尋餐廳、品項、地區…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--ink)' }}
                />
                {query && (
                  <button onClick={() => setQuery('')} className="flex-shrink-0">
                    <X size={16} style={{ color: 'var(--ink3)' }} />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: 'var(--surface)', color: 'var(--ink2)' }}
                >
                  取消
                </button>
              </div>

              {/* Results area */}
              <div className="py-2 max-h-96 overflow-y-auto">

                {/* Empty — not yet searched */}
                {!query && !loading && (
                  <div className="py-10 text-center space-y-2">
                    <p className="text-3xl">🔍</p>
                    <p className="text-sm" style={{ color: 'var(--ink3)' }}>輸入餐廳名稱、品項或地區</p>
                    <p style={{ fontSize: 11, color: 'var(--ink3)' }}>例如：「牛肉麵」、「大安區」、「鍋貼」</p>
                  </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                  <div className="space-y-1 px-2 py-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl animate-pulse">
                        <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: 'var(--surface)' }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 rounded-full w-3/4" style={{ background: 'var(--surface)' }} />
                          <div className="h-2.5 rounded-full w-1/2" style={{ background: 'var(--surface)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {!loading && searched && results.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-3xl mb-2">😕</p>
                    <p className="text-sm" style={{ color: 'var(--ink3)' }}>找不到「{query}」的推薦</p>
                    <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>換個關鍵字試試？</p>
                  </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                  <>
                    <p className="text-xs px-4 py-1.5 font-medium" style={{ color: 'var(--ink3)' }}>
                      找到 {results.length} 筆推薦
                    </p>
                    {results.map(item => {
                      const thumb = getThumb(item)
                      return (
                        <button
                          key={item.id}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                          style={{ background: 'transparent' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => handleSelect(item)}
                        >
                          {thumb ? (
                            <img src={thumb} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
                              style={{ background: 'var(--surface)' }}>
                              🍽️
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>
                              {item.menu_item?.name ?? item.restaurant.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin size={10} style={{ color: 'var(--ink3)' }} />
                              <p className="text-xs truncate" style={{ color: 'var(--ink3)' }}>
                                {item.restaurant.name}
                                {item.restaurant.district ? ` · ${item.restaurant.district}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Utensils size={11} style={{ color: 'var(--brand)' }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--brand)' }}>
                              {item.me_too_count}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
