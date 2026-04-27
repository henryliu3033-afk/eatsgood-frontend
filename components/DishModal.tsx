'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Bookmark, Users, MapPin, Tag } from 'lucide-react'
import { Recommendation } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { apiLikeRecommendation, apiSaveRecommendation, apiMeTooRecommendation } from '@/lib/api'
import TrustDensity from './TrustDensity'

interface DishModalProps {
  item: Recommendation | null
  onClose: () => void
}

const LEVEL_EMOJI: Record<string, string> = {
  '頂級老饕': '👑',
  '美食達人': '🍱',
  '資深吃貨': '🍜',
  '新手吃貨': '🥄',
}

export default function DishModal({ item, onClose }: DishModalProps) {
  const { isLoggedIn, openAuthModal } = useAuth()

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [meTood, setMeTood] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saveCount, setSaveCount] = useState(0)
  const [meTooCount, setMeTooCount] = useState(0)
  const [busy, setBusy] = useState<'like' | 'save' | 'metoo' | null>(null)

  // Reset state on item change
  useEffect(() => {
    if (item) {
      setLiked(item.is_liked ?? false)
      setSaved(item.is_saved ?? false)
      setMeTood(false)
      setLikeCount(item.likes_count)
      setSaveCount(item.saves_count)
      setMeTooCount(item.me_too_count)
      setBusy(null)
    }
  }, [item?.id])

  useEffect(() => {
    document.body.style.overflow = item ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [item])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const requireAuth = useCallback(() => { openAuthModal() }, [openAuthModal])

  const handleLike = useCallback(async () => {
    if (!isLoggedIn) { requireAuth(); return }
    if (busy || !item) return
    const prev = liked; const prevCount = likeCount
    setLiked(!prev); setLikeCount(c => prev ? c - 1 : c + 1)
    setBusy('like')
    try { await apiLikeRecommendation(item.id) }
    catch { setLiked(prev); setLikeCount(prevCount) }
    finally { setBusy(null) }
  }, [isLoggedIn, liked, likeCount, busy, item, requireAuth])

  const handleSave = useCallback(async () => {
    if (!isLoggedIn) { requireAuth(); return }
    if (busy || !item) return
    const prev = saved; const prevCount = saveCount
    setSaved(!prev); setSaveCount(c => prev ? c - 1 : c + 1)
    setBusy('save')
    try { await apiSaveRecommendation(item.id) }
    catch { setSaved(prev); setSaveCount(prevCount) }
    finally { setBusy(null) }
  }, [isLoggedIn, saved, saveCount, busy, item, requireAuth])

  const handleMeToo = useCallback(async () => {
    if (!isLoggedIn) { requireAuth(); return }
    if (busy || !item) return
    const prev = meTood; const prevCount = meTooCount
    setMeTood(!prev); setMeTooCount(c => prev ? c - 1 : c + 1)
    setBusy('metoo')
    try { await apiMeTooRecommendation(item.id) }
    catch { setMeTood(prev); setMeTooCount(prevCount) }
    finally { setBusy(null) }
  }, [isLoggedIn, meTood, meTooCount, busy, item, requireAuth])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
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
            className="relative w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--card)', maxHeight: '90vh' }}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              <X size={18} style={{ color: 'var(--ink)' }} />
            </button>

            <div className="flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden" style={{ maxHeight: '90vh' }}>
              {/* Left — Image */}
              <div className="sm:w-1/2 shrink-0">
                <img
                  src={item.image_urls[0]}
                  alt={item.menu_item?.name ?? item.restaurant.name}
                  className="w-full h-56 sm:h-full object-cover"
                  style={{ minHeight: '240px' }}
                />
              </div>

              {/* Right — Content */}
              <div className="sm:w-1/2 overflow-y-auto p-6 space-y-5">
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                    {item.menu_item?.name ?? item.restaurant.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin size={13} style={{ color: 'var(--ink3)' }} />
                    <span className="text-sm" style={{ color: 'var(--ink2)' }}>{item.restaurant.name}</span>
                    {item.restaurant.district && (
                      <>
                        <span style={{ color: 'var(--ink3)' }}>·</span>
                        <span className="text-sm" style={{ color: 'var(--ink3)' }}>{item.restaurant.district}</span>
                      </>
                    )}
                  </div>
                  {item.menu_item?.price && (
                    <div className="flex items-center gap-1 mt-1">
                      <Tag size={13} style={{ color: 'var(--ink3)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>NT$ {item.menu_item.price}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink2)' }}>{item.caption}</p>

                {item.why_love.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--ink3)' }}>
                      為什麼大家都愛這道
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {item.why_love.map((why, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm rounded-xl p-2.5"
                          style={{ background: 'var(--brand-soft)' }}>
                          <span className="text-base">{['🔥', '✨', '💯', '🎯'][i % 4]}</span>
                          <span style={{ color: 'var(--ink2)' }}>{why}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl" style={{ background: 'var(--brand-soft)' }}>
                  <TrustDensity count={meTooCount} />
                </div>

                <div className="flex items-center gap-3 pt-1 pb-1">
                  <img src={item.user.avatar_url} alt={item.user.display_name}
                    className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                      {LEVEL_EMOJI[item.user.trust_level]} {item.user.display_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--ink3)' }}>{item.user.trust_level}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: 'var(--surface)', color: 'var(--ink2)' }}>
                    權重 ×{item.trust_weight.toFixed(1)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pb-2">
                  {/* Me Too */}
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'var(--brand)', color: '#fff', opacity: busy === 'metoo' ? 0.7 : 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMeToo}
                    disabled={busy === 'metoo'}
                  >
                    <Heart size={16} fill={meTood ? '#fff' : 'none'} />
                    <span>{meTood ? '已加入！' : '我也愛吃'}</span>
                    <span className="opacity-80">({meTooCount})</span>
                  </motion.button>

                  {/* Save */}
                  <motion.button
                    className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 relative"
                    style={{ background: saved ? 'var(--brand)' : 'var(--surface)', opacity: busy === 'save' ? 0.7 : 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSave}
                    disabled={busy === 'save'}
                    title={`收藏 (${saveCount})`}
                  >
                    <Bookmark size={16} fill={saved ? '#fff' : 'none'}
                      style={{ color: saved ? '#fff' : 'var(--ink2)' }} />
                    {saveCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold border"
                        style={{ background: saved ? 'var(--brand)' : 'var(--surface)', color: saved ? '#fff' : 'var(--ink3)', fontSize: 9, borderColor: 'var(--card)' }}>
                        {saveCount > 99 ? '99+' : saveCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Like */}
                  <motion.button
                    className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 relative"
                    style={{ background: liked ? '#FEE2E2' : 'var(--surface)', opacity: busy === 'like' ? 0.7 : 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    disabled={busy === 'like'}
                    title={`按讚 (${likeCount})`}
                  >
                    <Users size={16} style={{ color: liked ? '#EF4444' : 'var(--ink2)' }} />
                    {likeCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold border"
                        style={{ background: liked ? '#EF4444' : 'var(--surface)', color: liked ? '#fff' : 'var(--ink3)', fontSize: 9, borderColor: 'var(--card)' }}>
                        {likeCount > 99 ? '99+' : likeCount}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Count summary */}
                <div className="flex items-center justify-center gap-4 pb-1">
                  <span className="text-xs" style={{ color: 'var(--ink3)' }}>❤️ {meTooCount} 人也愛吃</span>
                  <span className="text-xs" style={{ color: 'var(--ink3)' }}>🔖 {saveCount} 人收藏</span>
                  <span className="text-xs" style={{ color: 'var(--ink3)' }}>👍 {likeCount} 人按讚</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
