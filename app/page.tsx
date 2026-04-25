'use client'

import { useState, useMemo, useEffect } from 'react'
import { Recommendation } from '@/lib/types'
import { FilterTag } from '@/lib/types'
import { MOCK_RECOMMENDATIONS, MOCK_VIRAL_ITEM } from '@/lib/mockData'
import { apiGetTrendingFeed, FeedItemOut } from '@/lib/api'

import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import FilterRail from '@/components/FilterRail'
import FeedGrid from '@/components/FeedGrid'
import DishModal from '@/components/DishModal'
import RecommendModal from '@/components/RecommendModal'
import AuthModal from '@/components/AuthModal'

// ─── Adapter: backend FeedItemOut → frontend Recommendation ────────────────

function adaptFeedItem(item: FeedItemOut): Recommendation {
  const rec = item.recommendation
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
      : {
          id: '',
          name: rec.menu_item?.name ?? '',
          address: '',
          district: '',
          category: '',
        },
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
    likes_count: item.like_count,
    saves_count: item.save_count,
    me_too_count: item.me_too_count,
    created_at: rec.created_at,
    tags: [
      rec.restaurant?.category,
      rec.restaurant?.district,
    ].filter(Boolean) as string[],
    why_love: [],
  }
}

// ────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('全部')
  const [selectedDish, setSelectedDish] = useState<Recommendation | null>(null)
  const [recommendOpen, setRecommendOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [feedItems, setFeedItems] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS)
  const [feedLoading, setFeedLoading] = useState(true)

  useEffect(() => {
    apiGetTrendingFeed()
      .then(items => {
        if (items.length > 0) {
          setFeedItems(items.map(adaptFeedItem))
        }
        // If empty, keep mock data so UI never looks blank during development
      })
      .catch(() => {
        // Backend not running — silently fall back to mock data
      })
      .finally(() => setFeedLoading(false))
  }, [])

  const filteredItems = useMemo(() => {
    if (activeFilter === '全部') return feedItems
    return feedItems.filter(
      r => r.tags.includes(activeFilter) || r.restaurant.category === activeFilter,
    )
  }, [activeFilter, feedItems])

  const handleOpenViral = () => {
    setSelectedDish(MOCK_VIRAL_ITEM.recommendation!)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav
        onAuthOpen={() => setAuthOpen(true)}
        onRecommendOpen={() => setRecommendOpen(true)}
        onSearchSelect={(item) => setSelectedDish(item)}
      />

      <main className="max-w-screen-xl mx-auto space-y-4 pb-12">
        <Hero viral={MOCK_VIRAL_ITEM} onOpenDish={handleOpenViral} />

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
        onSubmitSuccess={(newRec) => {
          setFeedItems(prev => [newRec, ...prev])
        }}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
