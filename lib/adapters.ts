// ─── Backend → Frontend Type Adapters ────────────────────────────────────────
// 把後端 API 的 RecommendationOut / FeedItemOut 轉成前端 Recommendation 型別

import { RecommendationOut, FeedItemOut } from '@/lib/api'
import { Recommendation } from '@/lib/types'

/** RecommendationOut（搜尋結果）→ Recommendation */
export function adaptRecommendationOut(rec: RecommendationOut): Recommendation {
  const ts = rec.user.trust_score
  return {
    id: rec.id,
    user: {
      id: rec.user.id,
      display_name: rec.user.display_name,
      avatar_url: rec.user.avatar_url ?? `https://i.pravatar.cc/40?u=${rec.user.id}`,
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
    likes_count: rec.like_count,
    saves_count: rec.save_count,
    me_too_count: rec.me_too_count,
    created_at: rec.created_at,
    tags: [rec.restaurant?.category, rec.restaurant?.district].filter(Boolean) as string[],
    why_love: [],
    is_liked: false,
    is_saved: false,
  }
}

/** FeedItemOut（trending / viral feed）→ Recommendation */
export function adaptFeedItem(item: FeedItemOut): Recommendation {
  return adaptRecommendationOut(item.recommendation)
}

/** FeedItemOut（viral feed 第一筆）→ ViralItem */
export function adaptViralFeedItem(item: FeedItemOut): import('@/lib/types').ViralItem {
  const rec = adaptRecommendationOut(item.recommendation)
  const raw = item.recommendation
  return {
    target_type: raw.menu_item ? 'menu_item' : 'restaurant',
    target_id: raw.menu_item?.id ?? raw.restaurant?.id ?? '',
    unique_recommenders: item.unique_recommenders,
    weighted_score: item.weighted_score,
    recommendation: rec,
  }
}
