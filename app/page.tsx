'use client'

import { useState, useMemo } from 'react'
import { Recommendation } from '@/lib/types'
import { FilterTag } from '@/lib/types'
import { MOCK_RECOMMENDATIONS, MOCK_VIRAL_ITEM } from '@/lib/mockData'

import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import FilterRail from '@/components/FilterRail'
import FeedGrid from '@/components/FeedGrid'
import DishModal from '@/components/DishModal'
import RecommendModal from '@/components/RecommendModal'
import AuthModal from '@/components/AuthModal'

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('全部')
  const [selectedDish, setSelectedDish] = useState<Recommendation | null>(null)
  const [recommendOpen, setRecommendOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const filteredItems = useMemo(() => {
    if (activeFilter === '全部') return MOCK_RECOMMENDATIONS
    return MOCK_RECOMMENDATIONS.filter(r =>
      r.tags.includes(activeFilter) || r.restaurant.category === activeFilter
    )
  }, [activeFilter])

  const handleOpenViral = () => {
    setSelectedDish(MOCK_VIRAL_ITEM.recommendation!)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Navigation */}
      <Nav
        onAuthOpen={() => setAuthOpen(true)}
        onRecommendOpen={() => setRecommendOpen(true)}
        onSearchSelect={(item) => setSelectedDish(item)}
      />

      <main className="max-w-screen-xl mx-auto space-y-4 pb-12">
        {/* Hero — Viral showcase */}
        <Hero viral={MOCK_VIRAL_ITEM} onOpenDish={handleOpenViral} />

        {/* Section header */}
        <div className="px-4 sm:px-6 pt-2">
          <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
            大家都在推 🍽️
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink3)' }}>
            由真實吃貨推薦，Trust Density 越高越可信
          </p>
        </div>

        {/* Filter Rail */}
        <FilterRail active={activeFilter} onChange={setActiveFilter} />

        {/* Feed Grid */}
        <FeedGrid items={filteredItems} onSelect={setSelectedDish} />
      </main>

      {/* Modals */}
      <DishModal item={selectedDish} onClose={() => setSelectedDish(null)} />
      <RecommendModal open={recommendOpen} onClose={() => setRecommendOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
