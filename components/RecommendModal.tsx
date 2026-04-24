'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ImagePlus, ChevronRight } from 'lucide-react'

interface RecommendModalProps {
  open: boolean
  onClose: () => void
}

const MOCK_RESTAURANTS = [
  { id: 'r1', name: '阿忠牛肉麵', district: '大安區' },
  { id: 'r2', name: '添好運點心', district: '信義區' },
  { id: 'r3', name: '鮨一郎', district: '中山區' },
  { id: 'r4', name: '老爸燒肉', district: '松山區' },
  { id: 'r5', name: 'Pâtisserie Fou Fou', district: '大安區' },
]

type Step = 'restaurant' | 'dish' | 'caption' | 'done'

export default function RecommendModal({ open, onClose }: RecommendModalProps) {
  const [step, setStep] = useState<Step>('restaurant')
  const [restaurantQuery, setRestaurantQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof MOCK_RESTAURANTS[0] | null>(null)
  const [dishName, setDishName] = useState('')
  const [price, setPrice] = useState('')
  const [caption, setCaption] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const filteredRestaurants = restaurantQuery
    ? MOCK_RESTAURANTS.filter(r => r.name.includes(restaurantQuery) || r.district.includes(restaurantQuery))
    : MOCK_RESTAURANTS

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setStep('restaurant') }
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const stepIndex: Record<Step, number> = { restaurant: 0, dish: 1, caption: 2, done: 3 }

  const handleSubmit = () => {
    setStep('done')
    setTimeout(() => {
      onClose()
      setStep('restaurant')
      setSelectedRestaurant(null)
      setDishName('')
      setCaption('')
      setImagePreview(null)
    }, 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />

          <motion.div
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--card)' }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>推薦一道菜</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink3)' }}>
                  {{ restaurant: '選擇餐廳', dish: '選擇品項', caption: '寫下推薦理由', done: '完成！' }[step]}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface)' }}>
                <X size={15} style={{ color: 'var(--ink2)' }} />
              </button>
            </div>

            {/* Step indicator */}
            {step !== 'done' && (
              <div className="flex gap-1.5 px-6 pb-4">
                {(['restaurant', 'dish', 'caption'] as Step[]).map((s, i) => (
                  <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: stepIndex[step] >= i ? 'var(--brand)' : 'var(--surface)' }} />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Step 1 */}
              {step === 'restaurant' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--surface)' }}>
                    <Search size={15} style={{ color: 'var(--ink3)' }} />
                    <input
                      value={restaurantQuery}
                      onChange={e => setRestaurantQuery(e.target.value)}
                      placeholder="輸入餐廳名稱或地區…"
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--ink)' }}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {filteredRestaurants.map(r => (
                      <button key={r.id}
                        onClick={() => { setSelectedRestaurant(r); setStep('dish') }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                        style={{ background: 'var(--surface)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-soft)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{r.name}</p>
                          <p className="text-xs" style={{ color: 'var(--ink3)' }}>{r.district}</p>
                        </div>
                        <ChevronRight size={15} style={{ color: 'var(--ink3)' }} />
                      </button>
                    ))}
                    <button
                      onClick={() => { setSelectedRestaurant({ id: 'new', name: restaurantQuery || '新餐廳', district: '' }); setStep('dish') }}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                      style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
                    >
                      <span className="text-lg">+</span>
                      新增「{restaurantQuery || '我的餐廳'}」到資料庫
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 'dish' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--brand-soft)' }}>
                    <p className="text-xs" style={{ color: 'var(--ink3)' }}>餐廳</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{selectedRestaurant?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--ink2)' }}>品項名稱 *</label>
                    <input value={dishName} onChange={e => setDishName(e.target.value)}
                      placeholder="例如：招牌紅燒牛肉麵"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                      autoFocus />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--ink2)' }}>價格（選填）</label>
                    <input value={price} onChange={e => setPrice(e.target.value)}
                      placeholder="NT$ 220"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--surface)', color: 'var(--ink)' }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--ink2)' }}>上傳照片（選填）</label>
                    <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed cursor-pointer"
                      style={{ borderColor: imagePreview ? 'var(--brand)' : 'var(--border)', background: 'var(--surface)' }}>
                      {imagePreview
                        ? <img src={imagePreview} alt="" className="w-20 h-20 rounded-xl object-cover" />
                        : <>
                            <ImagePlus size={24} style={{ color: 'var(--ink3)' }} />
                            <span className="text-xs" style={{ color: 'var(--ink3)' }}>點擊上傳食物照片</span>
                          </>
                      }
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) setImagePreview(URL.createObjectURL(file))
                        }} />
                    </label>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setStep('restaurant')}
                      className="px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ background: 'var(--surface)', color: 'var(--ink2)' }}>返回</button>
                    <button onClick={() => dishName.trim() && setStep('caption')}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold active:scale-95"
                      style={{ background: dishName.trim() ? 'var(--brand)' : 'var(--surface)', color: dishName.trim() ? '#fff' : 'var(--ink3)' }}>
                      下一步
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 'caption' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--brand-soft)' }}>
                    <p className="text-xs" style={{ color: 'var(--ink3)' }}>推薦品項</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                      {dishName} · {selectedRestaurant?.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--ink2)' }}>為什麼你強推這道？ *</label>
                    <textarea value={caption} onChange={e => setCaption(e.target.value)}
                      placeholder="用你自己的話說說這道菜哪裡特別好吃……"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                      style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                      autoFocus />
                    <p className="text-xs text-right"
                      style={{ color: caption.length > 200 ? 'var(--brand)' : 'var(--ink3)' }}>
                      {caption.length} / 280
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('dish')}
                      className="px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ background: 'var(--surface)', color: 'var(--ink2)' }}>返回</button>
                    <button onClick={handleSubmit} disabled={!caption.trim()}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold active:scale-95"
                      style={{ background: caption.trim() ? 'var(--brand)' : 'var(--surface)', color: caption.trim() ? '#fff' : 'var(--ink3)' }}>
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
                  <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>推薦成功！</h3>
                  <p className="text-sm text-center" style={{ color: 'var(--ink3)' }}>
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
