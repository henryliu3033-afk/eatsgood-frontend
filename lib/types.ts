export type TrustLevel = '新手吃貨' | '資深吃貨' | '美食達人' | '頂級老饕'

export interface User {
  id: string
  display_name: string
  avatar_url: string
  trust_level: TrustLevel
  trust_score: number
  recommendation_count: number
}

export interface Restaurant {
  id: string
  name: string
  address: string
  district: string
  category: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description?: string
  price?: number
  image_url?: string
}

export interface Recommendation {
  id: string
  user: User
  restaurant: Restaurant
  menu_item?: MenuItem
  caption: string
  image_urls: string[]
  trust_weight: number
  likes_count: number
  saves_count: number
  me_too_count: number
  created_at: string
  tags: string[]
  why_love: string[]
  is_liked?: boolean
  is_saved?: boolean
}

export interface ViralItem {
  target_type: 'restaurant' | 'menu_item'
  target_id: string
  unique_recommenders: number
  weighted_score: number
  recommendation?: Recommendation
}

export type FilterTag = '全部' | '牛肉麵' | '港式飲茶' | '日式料理' | '燒烤' | '甜點' | '素食'
