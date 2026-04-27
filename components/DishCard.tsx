'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Bookmark, MapPin } from 'lucide-react'
import { Recommendation } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { apiLikeRecommendation, apiSaveRecommendation } from '@/lib/api'
import TrustDensity from './TrustDensity'

interface DishCardProps {
  item: Recommendation
  onClick: (item: Recommendation) => void
  index?: number
}

const TRUST_LEVEL_BADGE: Record<string, string> = {
  '頂級老饕': '👑',
  '美食達人': '🍱',
  '資深吃貨': '🍜',
  '新手吃貨': '🥄',
}

export default function DishCard({ item, onClick, index = 0 }: DishCardProps) {
  const { isLoggedIn, openAuthModal } = useAuth()

  const [liked, setLiked] = useState(item.is_liked ?? false)
  const [saved, setSaved] = useState(item.is_saved ?? false)
  const [likeCount, setLikeCount] = useState(item.likes_count)
  const [saveCount, setSaveCount] = useState(item.saves_count)
  const [hint, setHint] = useState<'like' | 'save' | null>(null)
  const [busy, setBusy] = useState<'like' | 'save' | null>(null)

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      setHint('like')
      setTimeout(() => setHint(null), 1800)
      openAuthModal()
      return
    }
    if (busy) return
    const prev = liked
    const prevCount = likeCount
    setLiked(!prev)
    setLikeCount(c => prev ? c - 1 : c + 1)
    setBusy('like')
    try {
      await apiLikeRecommendation(item.id)
    } catch {
      setLiked(prev)
      setLikeCount(prevCount)
    } finally {
      setBusy(null)
    }
  }, [isLoggedIn, liked, likeCount, busy, item.id, openAuthModal])

  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      setHint('save')
      setTimeout(() => setHint(null), 1800)
      openAuthModal()
      return
    }
    if (busy) return
    const prev = saved
    const prevCount = saveCount
    setSaved(!prev)
    setSaveCount(c => prev ? c - 1 : c + 1)
    setBusy('save')
    try {
      await apiSaveRecommendation(item.id)
    } catch {
      setSaved(prev)
      setSaveCount(prevCount)
    } finally {
      setBusy(null)
    }
  }, [isLoggedIn, saved, saveCount, busy, item.id, openAuthModal])

  return (
    <motion.article
      className="group cursor-pointer rounded-2xl overflow-hidden relative shadow-sm hover:shadow-lg"
      style={{ background: 'var(--card)' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onClick(item)}
    >
      <AnimatePresence>
        {hint && (
          <motion.div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg pointer-events-none"
            style={{ background: 'var(--ink)', color: 'var(--ink-inv)' }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {hint === 'like' ? '請先登入才能按愛心 🔒' : '請先登入才能收藏 🔒'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative overflow-hidden aspect-4/3">
        <Image
          src={item.image_urls[0]}
          alt={item.menu_item?.name ?? item.restaurant.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }}
        />

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: liked ? 'var(--brand)' : 'rgba(255,255,255,0.92)' }}
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
          >
            <Heart size={14} fill={liked ? '#fff' : 'none'} color={liked ? '#fff' : '#5B4E45'} />
          </motion.button>
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: saved ? 'var(--brand)' : 'rgba(255,255,255,0.92)' }}
            whileTap={{ scale: 0.85 }}
            onClick={handleSave}
          >
            <Bookmark size={14} fill={saved ? '#fff' : 'none'} color={saved ? '#fff' : '#5B4E45'} />
          </motion.button>
        </div>

        {item.me_too_count >= 100 && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: 'var(--brand)' }}>
              🔥 全城熱議
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-base leading-tight line-clamp-1" style={{ color: 'var(--ink)' }}>
            {item.menu_item?.name ?? item.restaurant.name}
          </h3>
          <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--ink3)' }}>
            <MapPin size={11} />
            <span className="text-xs truncate">
              {item.restaurant.name} · {item.restaurant.district}
            </span>
          </div>
        </div>

        <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--ink2)' }}>
          {item.caption}
        </p>

        <TrustDensity count={item.me_too_count} compact />

        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Image
              src={item.user.avatar_url}
              alt={item.user.display_name}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-xs font-medium truncate" style={{ color: 'var(--ink2)' }}>
              {TRUST_LEVEL_BADGE[item.user.trust_level]} {item.user.display_name}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {likeCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs" style={{ color: liked ? 'var(--brand)' : 'var(--ink3)' }}>
                <Heart size={10} fill={liked ? 'currentColor' : 'none'} />
                {likeCount}
              </span>
            )}
            {saveCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs" style={{ color: saved ? 'var(--brand)' : 'var(--ink3)' }}>
                <Bookmark size={10} fill={saved ? 'currentColor' : 'none'} />
                {saveCount}
              </span>
            )}
            {item.menu_item?.price && (
              <span className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                NT${item.menu_item.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
