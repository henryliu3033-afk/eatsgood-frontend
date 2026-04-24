'use client'

import { motion } from 'framer-motion'
import { Flame, MapPin, Tag } from 'lucide-react'
import { ViralItem } from '@/lib/types'
import { RECOMMENDERS_AVATARS } from '@/lib/mockData'
import TrustDensity from './TrustDensity'

interface HeroProps {
  viral: ViralItem
  onOpenDish: () => void
}

export default function Hero({ viral, onOpenDish }: HeroProps) {
  const rec = viral.recommendation!
  const dish = rec.menu_item?.name ?? rec.restaurant.name

  return (
    <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 mt-4"
      style={{ minHeight: '420px', background: 'var(--bg-alt)' }}>
      {/* Background image */}
      <img
        src={rec.image_urls[0]}
        alt={dish}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(234,88,12,0.7) 0%, rgba(26,15,8,0.85) 60%)' }} />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end h-full" style={{ minHeight: '420px' }}>
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 mb-4 self-start"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}>
            <Flame size={13} />
            全城熱議 · {viral.unique_recommenders} 人強推
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2"
          style={{ fontFamily: 'ui-serif, Georgia, serif', fontStyle: 'italic' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {dish}
        </motion.h1>

        {/* Restaurant info */}
        <motion.div
          className="flex items-center gap-3 mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-white opacity-70" />
            <span className="text-sm text-white opacity-80">{rec.restaurant.name}</span>
          </div>
          <span className="text-white opacity-40">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white opacity-80">{rec.restaurant.district}</span>
          </div>
          {rec.menu_item?.price && (
            <>
              <span className="text-white opacity-40">·</span>
              <div className="flex items-center gap-1.5">
                <Tag size={13} className="text-white opacity-70" />
                <span className="text-sm text-white opacity-80">NT${rec.menu_item.price}</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Trust Density row */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Avatar stack */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {RECOMMENDERS_AVATARS.map((src, i) => (
                <img key={i} src={src} alt=""
                  className="w-8 h-8 rounded-full ring-2 object-cover"
                  style={{ zIndex: 5 - i }} />
              ))}
              <div className="w-8 h-8 rounded-full ring-2 ring-orange-600 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: '#EA580C', zIndex: 0 }}>
                +{viral.unique_recommenders - 5}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{viral.unique_recommenders} 人強推</p>
              <p className="text-xs text-white opacity-60">正式觸發全城熱議 🔥</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex-1 max-w-xs">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #F97316, #FBBF24)' }} />
            </div>
            <p className="text-xs text-white opacity-60 mt-1">
              信任分累計 {viral.weighted_score.toLocaleString()}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onOpenDish}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            看完整推薦 →
          </button>
        </motion.div>
      </div>
    </section>
  )
}
