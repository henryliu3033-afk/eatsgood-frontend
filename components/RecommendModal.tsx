'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ImagePlus, ChevronRight, Loader2 } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useAuth } from '@/context/AuthContext'
import {
  apiSearchRestaurants,
  apiCreateRestaurant,
  apiCreateRecommendation,
  RestaurantOut,
  RecommendationOut,
} from '@/lib/api'
import { Recommendation } from '@/lib/types'

interface RecommendModalProps {
  open: boolean
  onClose: () => void
  onSubmitSuccess?: (rec: Recommendation) => void
}

type Step = 'restaurant' | 'dish' | 'caption' | 'done'

function adaptRecommendation(rec: RecommendationOut): Recommendation {
  const user = rec.user
  const ts = user.trust_score
  return {
    id: rec.id,
    user: {
      id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url ?? `https://i.pravatar.cc/40?u=${user.id}`,
      trust_level: ts?.level ?? '新手吃貨',
      trust_score: ts?.trust_score ?? 0,
      recommendation_count: ts?.recommendation_count ?? 0,
    },
    restaurant: rec.restaurant
      ? {
          id: rec.restaurant.id,
          name: rec.restaurant.name,
          address: rec.restaurant.address ?? '',
          district: rec.restaurant.district ?? '',
          category: rec.restaurant.category ?? '',
        }
      : { id: '', name: '', address: '', district: '', category: '' },
    menu_item: rec.menu_item
      ? {
          id: rec.menu_item.id,
          restaurant_id: rec.menu_item.restaurant_id,
          name: rec.menu_item.name,
          description: rec.menu_item.description ?? undefined,
          price: rec.menu_item.price ?? undefined,
          image_url: rec.menu_item.image_url ?? undefined,
        }
      : undefined,
    caption: rec.caption,
    image_urls: rec.image_urls,
    trust_weight: rec.trust_weight,
    likes_count: 0,
    saves_count: 0,
    me_too_count: 0,
    created_at: rec.created_at,
    tags: [
      rec.restaurant?.category,
      rec.restaurant?.district,
    ].filter(Boolean) as string[],
    why_love: [],
  }
}

export default function RecommendModal({ open, onClose, onSubmitSuccess }: RecommendModalProps) {
  const { isLoggedIn, openAuthModal } = useAuth()
  const [step, setStep] = useState<Step>('restaurant')

  // Restaurant search
  const [restaurantQuery, setRestaurantQuery] = useState('')
  const [restaurantResults, setRestaurantResults] = useState<RestaurantOut[]>([])
  const [restaurantSearching, setRestaurantSearching] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantOut | null>(null)

  // Dish
  const [dishName, setDishName] = useState('')
  const [price, setPrice] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Caption
  const [caption, setCaption] = useState('')

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useScrollLock(open)

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep('restaurant')
      setRestaurantQuery('')
      setRestaurantResults([])
      setSelectedRestaurant(null)
      setDishName('')
      setPrice('')
      setCaption('')
      setImagePreview(null)
      setSubmitError(null)
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  // Debounced restaurant search
  useEffect(() => {
    if (!restaurantQuery.trim()) {
      setRestaurantResults([])
      return
    }
    const timer = setTimeout(async () => {
      setRestaurantSearching(true)
      try {
        const results = await apiSearchRestaurants(restaurantQuery, 8)
        setRestaurantResults(results)
      } catch {
        setRestaurantResults([])
      } finally {
        setRestaurantSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [restaurantQuery])

  const handleSelectRestaurant = useCallback((r: RestaurantOut) => {
    setSelectedRestaurant(r)
    setStep('dish')
  }, [])

  const handleAddNewRestaurant = useCallback(async () => {
    if (!restaurantQuery.trim()) return
    setRestaurantSearching(true)
    try {
      const newRest = await apiCreateRestaurant({ name: restaurantQuery.trim() })
      setSelectedRestaurant(newRest)
      setStep('dish')
    } catch {
      // If not logged in, trigger auth modal
      onClose()
      openAuthModal()
    } finally {
      setRestaurantSearching(false)
    }
  }, [restaurantQuery, onClose, openAuthModal])

  const handleSubmit = useCallback(async () => {
    if (!isLoggedIn) {
      onClose()
      openAuthModal()
      return
    }
    if (!selectedRestaurant || !caption.trim()) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const newRec = await apiCreateRecommendation({
        restaurant_id: selectedRestaurant.id,
        caption: caption.trim(),
        image_urls: [],
      })
      setStep('done')
      onSubmitSuccess?.(adaptRecommendation(newRec))
      setTimeout(() => {
        onClose()
        setStep('restaurant')
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '發佈失敗，請稍後再試'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }, [isLoggedIn, selectedRestaurant, caption, onClose, openAuthModal, onSubmitSuccess])

  const stepIndex: Record<Step, number> = { restaurant: 0, dish: 1, caption: 2, done: 3 }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-card"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">推薦一道菜</h2>
                <p className="text-xs mt-0.5 text-ink-3">
                  {{ restaurant: '選擇餐廳', dish: '選擇品項', caption: '寫下推薦理由', done: '完成！' }[step]}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-surface"
              >
                <X size={15} className="text-ink-2" />
              </button>
            </div>

            {/* Step indicator */}
            {step !== 'done' && (
              <div className="flex gap-1.5 px-6 pb-4">
                {(['restaurant', 'dish', 'caption'] as Step[]).map((s, i) => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: stepIndex[step] >= i ? 'var(--brand)' : 'var(--surface)' }}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Step 1: Restaurant */}
              {step === 'restaurant' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface">
                    <Search size={15} className="text-ink-3 flex-shrink-0" />
                    <input
                      value={restaurantQuery}
                      onChange={e => setRestaurantQuery(e.target.value)}
                      placeholder="輸入餐廳名稱搜尋…"
                      className="flex-1 bg-transparent text-sm outline-none text-ink"
                      autoFocus
                    />
                    {restaurantSearching && <Loader2 size={14} className="animate-spin text-ink-3" />}
                  </div>

                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {restaurantResults.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSelectRestaurant(r)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all bg-surface hover:bg-brand-soft group"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">{r.name}</p>
                          <p className="text-xs text-ink-3">
                            {[r.district, r.category].filter(Boolean).join(' · ') || '無分類'}
                          </p>
                        </div>
                        <ChevronRight size={15} className="text-ink-3" />
                      </button>
                    ))}

                    {restaurantQuery.trim() && !restaurantSearching && (
                      <button
                        onClick={handleAddNewRestaurant}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-brand-soft text-brand"
                      >
                        <span className="text-lg">+</span>
                        新增「{restaurantQuery.trim()}」到資料庫
                      </button>
                    )}

                    {!restaurantQuery.trim() && (
                      <p className="text-sm text-center py-4 text-ink-3">
                        輸入關鍵字搜尋餐廳
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Dish */}
              {step === 'dish' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-brand-soft">
                    <p className="text-xs text-ink-3">餐廳</p>
                    <p className="text-sm font-semibold text-ink">{selectedRestaurant?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-ink-2">品項名稱 *</label>
                    <input
                      value={dishName}
                      onChange={e => setDishName(e.target.value)}
                      placeholder="例如：招牌紅燒牛肉麵"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-surface text-ink"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-ink-2">價格（選填）</label>
                    <input
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="NT$ 220"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-surface text-ink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-ink-2">上傳照片（選填）</label>
                    <label
                      className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed cursor-pointer bg-surface transition-colors"
                      style={{ borderColor: imagePreview ? 'var(--brand)' : 'var(--border)' }}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="" className="w-20 h-20 rounded-xl object-cover" />
                      ) : (
                        <>
                          <ImagePlus size={24} className="text-ink-3" />
                          <span className="text-xs text-ink-3">點擊上傳食物照片</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) setImagePreview(URL.createObjectURL(file))
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setStep('restaurant')}
                      className="px-4 py-3 rounded-xl text-sm font-medium bg-surface text-ink-2"
                    >
                      返回
                    </button>
                    <button
                      onClick={() => dishName.trim() && setStep('caption')}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-colors"
                      style={{
                        background: dishName.trim() ? 'var(--brand)' : 'var(--surface)',
                        color: dishName.trim() ? '#fff' : 'var(--ink3)',
                      }}
                    >
                      下一步
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Caption */}
              {step === 'caption' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-brand-soft">
                    <p className="text-xs text-ink-3">推薦品項</p>
                    <p className="text-sm font-semibold text-ink">
                      {dishName} · {selectedRestaurant?.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-ink-2">為什麼你強推這道？ *</label>
                    <textarea
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="用你自己的話說說這道菜哪裡特別好吃……"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-surface text-ink"
                      autoFocus
                    />
                    <p
                      className="text-xs text-right"
                      style={{ color: caption.length > 200 ? 'var(--brand)' : 'var(--ink3)' }}
                    >
                      {caption.length} / 280
                    </p>
                  </div>

                  {submitError && (
                    <p className="text-xs text-center px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                      {submitError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('dish')}
                      className="px-4 py-3 rounded-xl text-sm font-medium bg-surface text-ink-2"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!caption.trim() || submitting}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-colors"
                      style={{
                        background: caption.trim() ? 'var(--brand)' : 'var(--surface)',
                        color: caption.trim() ? '#fff' : 'var(--ink3)',
                      }}
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                      發佈推薦 🔥
                    </button>
                  </div>
                </div>
              )}

              {/* Done */}
              {step === 'done' && (
                <motion.div
                  className="flex flex-col items-center justify-center py-8 gap-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <span className="text-5xl">🎉</span>
                  <h3 className="text-lg font-bold text-ink">推薦成功！</h3>
                  <p className="text-sm text-center text-ink-3">
                    你的推薦已發佈，幫助更多人找到好吃的！
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
