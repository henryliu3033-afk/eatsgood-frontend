'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Bookmark, Users, MapPin, Tag } from 'lucide-react'
import { Recommendation } from '@/lib/types'
import TrustDensity from './TrustDensity'

interface DishModalProps {
  item: Recommendation | null
  onClose: () => void
}

export default function DishModal({ item, onClose }: DishModalProps) {
  useEffect(() => {
    document.body.style.overflow = item ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [item])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--card)', maxHeight: '90vh' }}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
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
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                    {item.menu_item?.name ?? item.restaurant.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin size={13} style={{ color: 'var(--ink3)' }} />
                    <span className="text-sm" style={{ color: 'var(--ink2)' }}>{item.restaurant.name}</span>
                    <span style={{ color: 'var(--ink3)' }}>·</span>
                    <span className="text-sm" style={{ color: 'var(--ink3)' }}>{item.restaurant.district}</span>
                  </div>
                  {item.menu_item?.price && (
                    <div className="flex items-center gap-1 mt-1">
                      <Tag size={13} style={{ color: 'var(--ink3)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>NT$ {item.menu_item.price}</span>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink2)' }}>{item.caption}</p>

                {/* Why people love */}
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

                {/* Trust Density */}
                <div className="p-4 rounded-2xl" style={{ background: 'var(--brand-soft)' }}>
                  <TrustDensity count={item.me_too_count} />
                </div>

                {/* Recommender */}
                <div className="flex items-center gap-3 pt-1 pb-1">
                  <img src={item.user.avatar_url} alt={item.user.display_name}
                    className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                      {item.user.display_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--ink3)' }}>{item.user.trust_level}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--surface)', color: 'var(--ink2)' }}>
                    信任分 {Math.round(item.trust_weight)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pb-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-95"
                    style={{ background: 'var(--brand)', color: '#fff' }}>
                    <Heart size={16} />
                    我也愛吃 ({item.me_too_count})
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-xl"
                    style={{ background: 'var(--surface)' }}>
                    <Bookmark size={16} style={{ color: 'var(--ink2)' }} />
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-xl"
                    style={{ background: 'var(--surface)' }}>
                    <Users size={16} style={{ color: 'var(--ink2)' }} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
