'use client'

import { Recommendation } from '@/lib/types'
import DishCard from './DishCard'

interface FeedGridProps {
  items: Recommendation[]
  onSelect: (item: Recommendation) => void
}

export default function FeedGrid({ items, onSelect }: FeedGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl">🍽️</span>
        <p className="text-base font-medium" style={{ color: 'var(--ink2)' }}>這個分類還沒有推薦</p>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>成為第一個推薦的人吧！</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-4 sm:px-6 pb-16">
      {items.map((item, i) => (
        <DishCard key={item.id} item={item} onClick={onSelect} index={i} />
      ))}
    </div>
  )
}
