// ─── API Client for EATSGOOD Backend ───────────────────────────────────────
// Base URL: http://localhost:8000

export const API_BASE = 'http://localhost:8000'

const TOKEN_KEY = 'eatsgood_token'

// ─── Token helpers ──────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── Fetch wrapper ──────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch {}
    throw new ApiError(res.status, detail)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Types (mirrors backend schemas) ────────────────────────────────────────

export interface TrustScoreOut {
  recommendation_count: number
  received_likes: number
  received_saves: number
  trust_score: number
  level: '新手吃貨' | '資深吃貨' | '美食達人' | '頂級老饕'
}

export interface UserOut {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  auth_provider: string
  created_at: string
  trust_score: TrustScoreOut | null
}

export interface RestaurantOut {
  id: string
  name: string
  address: string | null
  district: string | null
  lat: number | null
  lng: number | null
  google_place_id: string | null
  category: string | null
  opening_hours: Record<string, unknown> | null
  created_at: string
}

export interface MenuItemOut {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
}

export interface RecommendationOut {
  id: string
  user: UserOut
  restaurant: RestaurantOut | null
  menu_item: MenuItemOut | null
  caption: string
  image_urls: string[]
  trust_weight: number
  created_at: string
  like_count: number
  save_count: number
  me_too_count: number
}

export interface FeedItemOut {
  recommendation: RecommendationOut
  is_viral: boolean
  unique_recommenders: number
  weighted_score: number
  like_count: number
  save_count: number
  me_too_count: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiRegister(
  email: string,
  display_name: string,
  password: string,
): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, display_name, password }),
  })
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function apiLogout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' }, true)
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function apiGetMe(): Promise<UserOut> {
  return apiFetch<UserOut>('/users/me', {}, true)
}

// ─── Feed ────────────────────────────────────────────────────────────────────

export async function apiGetTrendingFeed(
  limit = 20,
  offset = 0,
): Promise<FeedItemOut[]> {
  return apiFetch<FeedItemOut[]>(`/feed/trending?limit=${limit}&offset=${offset}`)
}

export async function apiGetViralFeed(
  limit = 20,
  offset = 0,
): Promise<FeedItemOut[]> {
  return apiFetch<FeedItemOut[]>(`/feed/viral?limit=${limit}&offset=${offset}`)
}

export async function apiSearchFeed(
  q: string,
  limit = 20,
): Promise<RecommendationOut[]> {
  return apiFetch<RecommendationOut[]>(
    `/feed/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  )
}

// ─── Restaurants ─────────────────────────────────────────────────────────────

export async function apiSearchRestaurants(
  q: string,
  limit = 10,
): Promise<RestaurantOut[]> {
  return apiFetch<RestaurantOut[]>(
    `/restaurants?q=${encodeURIComponent(q)}&limit=${limit}`,
  )
}

export async function apiCreateRestaurant(data: {
  name: string
  district?: string
  address?: string
  category?: string
}): Promise<RestaurantOut> {
  return apiFetch<RestaurantOut>('/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true)
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export async function apiCreateRecommendation(data: {
  restaurant_id?: string
  menu_item_id?: string
  caption: string
  image_urls?: string[]
}): Promise<RecommendationOut> {
  return apiFetch<RecommendationOut>('/recommendations', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true)
}
