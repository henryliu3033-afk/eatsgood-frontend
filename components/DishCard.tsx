'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Bookmark, MapPin } from 'lucide-react'
import { Recommendation } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import TrustDensity from './TrustDensity'

interface DishCardProps {
  item: Recommendation
  onClick: (item: Recommendation) => void
  index?: number
}

const TRUST_LEVEL_BADGE: Record<string, string> = {
  '頂級老饕': '🏆',
  '美食達人': '⭐',
  '資深吃貨': '🍜',
  '新手吃貨': '🌱',
}

export default function DishCard({ item, onClick, index = 0 }: DishCardProps) {
  const { isLoggedIn, openAuthModal } = useAuth()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hint, setHint] = useState<'like' | 'save' | null>(null)

  const guardedAction = (e: React.MouseEvent, action: 'like' | 'save') => {
    e.stopPropagation()
    if (!isLoggedIn) {
      setHint(action)
      setTimeout(() => setHint(null), 1800)
      openAuthModal()
      return
    }
    if (action === 'like') setLiked(v => !v)
    if (action === 'save') setSaved(v => !v)
  }

  return (
    <motion.article
      className="group cursor-pointer rounded-2xl overflow-hidden relative"
      style={{ background: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)', transition: { duration: 0.2 } }}
      onClick={() => onClick(item)}
    >
      {/* 未登入提示 toast */}
      <AnimatePresence>
        {hint && (
          <motion.div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg pointer-events-none"
            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            請先登入才能{hint === 'like' ? '按愛心' : '收藏'} 🔒
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={item.image_urls[0]}
          alt={item.menu_item?.name ?? item.restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ background: liked ? 'var(--brand)' : 'rgba(255,255,255,0.92)' }}
            onClick={e => guardedAction(e, 'like')}
          >
            <Heart size={14} fill={liked ? '#fff' : 'none'} color={liked ? '#fff' : '#5B4E45'} />
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ background: saved ? 'var(--brand)' : 'rgba(255,255,255,0.92)' }}
            onClick={e => guardedAction(e, 'save')}
          >
            <Bookmark size={14} fill={saved ? '#fff' : 'none'} color={saved ? '#fff' : '#5B4E45'} />
          </button>
        </div>

        {/* Viral badge */}
        {item.me_too_count >= 100 && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-bold px-2 py-1 rounded-full text-white"
              style={{ background: 'var(--brand)' }}>
              🔥 全城熱議
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-base leading-tight line-clamp-1" style={{ color: 'var(--ink)' }}>
            {item.menu_item?.name ?? item.restaurant.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={11} style={{ color: 'var(--ink3)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--ink3)' }}>
              {item.restaurant.name} · {item.restaurant.district}
            </span>
          </div>
        </div>

        <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--ink2)' }}>
          {item.caption}
        </p>

        <TrustDensity count={item.me_too_count} compact />

        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5">
            <img src={item.user.avatar_url} alt={item.user.display_name}
              className="w-5 h-5 rounded-full object-cover" />
            <span className="text-xs font-medium" style={{ color: 'var(--ink2)' }}>
              {TRUST_LEVEL_BADGE[item.user.trust_level]} {item.user.display_name}
            </span>
          </div>
          {item.menu_item?.price && (
            <span className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>
              NT${item.menu_item.price}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
