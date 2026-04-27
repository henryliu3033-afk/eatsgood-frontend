'use client'

import { useState, useMemo, useEffect } from 'react'
import { Recommendation, ViralItem } from '@/lib/types'
import { FilterTag } from '@/lib/types'
import { MOCK_RECOMMENDATIONS, MOCK_VIRAL_ITEM } from '@/lib/mockData'
import { apiGetTrendingFeed, apiGetViralFeed } from '@/lib/api'
import { adaptFeedItem, adaptViralFeedItem } from '@/lib/adapters'

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
  const [feedItems, setFeedItems] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS)
  const [viralItem, setViralItem] = useState<ViralItem>(MOCK_VIRAL_ITEM)
  const [heroLoading, setHeroLoading] = useState(true)

  // Trending feed
  useEffect(() => {
    apiGetTrendingFeed()
      .then(items => { if (items.length > 0) setFeedItems(items.map(adaptFeedItem)) })
      .catch(() => {})
  }, [])

  // Viral feed → Hero
  useEffect(() => {
    apiGetViralFeed(1)
      .then(items => { if (items.length > 0) setViralItem(adaptViralFeedItem(items[0])) })
      .catch(() => {})
      .finally(() => setHeroLoading(false))
  }, [])

  const filteredItems = useMemo(() => {
    if (activeFilter === '全部') return feedItems
    return feedItems.filter(
      r => r.tags.includes(activeFilter) || r.restaurant.category === activeFilter,
    )
  }, [activeFilter, feedItems])

  const handleOpenViral = () => setSelectedDish(viralItem.recommendation ?? null)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav
        onAuthOpen={() => setAuthOpen(true)}
        onRecommendOpen={() => setRecommendOpen(true)}
        onSearchSelect={(item) => setSelectedDish(item)}
      />

      <main className="max-w-screen-xl mx-auto space-y-4 pb-12">
        <Hero viral={viralItem} onOpenDish={handleOpenViral} loading={heroLoading} />

        <div className="px-4 sm:px-6 pt-2">
          <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
            大家都在推 🍽️
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink3)' }}>
            由真實吃貨推薦，Trust Density 越高越可信
          </p>
        </div>

        <FilterRail active={activeFilter} onChange={setActiveFilter} />
        <FeedGrid items={filteredItems} onSelect={setSelectedDish} />
      </main>

      <DishModal item={selectedDish} onClose={() => setSelectedDish(null)} />
      <RecommendModal
        open={recommendOpen}
        onClose={() => setRecommendOpen(false)}
        onSubmitSuccess={(newRec) => setFeedItems(prev => [newRec, ...prev])}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
