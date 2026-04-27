'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Utensils } from 'lucide-react'
import { apiGetUser, UserOut } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import LevelProgress from '@/components/LevelProgress'
import { TrustLevel } from '@/lib/levelSystem'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user: me } = useAuth()

  const [profile, setProfile] = useState<UserOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile = me?.id === id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    apiGetUser(id)
      .then(setProfile)
      .catch(() => setError('找不到這位用戶'))
      .finally(() => setLoading(false))
  }, [id])

  const ts = profile?.trust_score

  // Format date
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
      })
    : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 h-14 max-w-screen-sm mx-auto"
        style={{
          background: 'rgba(var(--bg-nav,250,247,242),0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'var(--surface)' }}
        >
          <ArrowLeft size={16} style={{ color: 'var(--ink2)' }} />
        </button>
        <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
          {isOwnProfile ? '我的頁面' : '用戶資料'}
        </span>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 pb-12">
        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">😕</p>
            <p style={{ color: 'var(--ink3)' }}>{error}</p>
          </div>
        )}

        {/* ── Profile ── */}
        {profile && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5 pt-6"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ outline: '3px solid var(--brand)', outlineOffset: '2px' }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0"
                  style={{
                    background: 'var(--brand)',
                    color: '#fff',
                    outline: '3px solid var(--brand)',
                    outlineOffset: '2px',
                  }}
                >
                  {profile.display_name.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate" style={{ color: 'var(--ink)' }}>
                  {profile.display_name}
                </h1>
                {ts && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-base">{
                      ts.level === '新手吃貨' ? '🥄' :
                      ts.level === '資深吃貨' ? '🍜' :
                      ts.level === '美食達人' ? '🍱' : '👑'
                    }</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink2)' }}>
                      {ts.level}
                    </span>
                  </div>
                )}
                {joinDate && (
                  <div className="flex items-center gap-1 mt-1">
                    <CalendarDays size={12} style={{ color: 'var(--ink3)' }} />
                    <span style={{ fontSize: 12, color: 'var(--ink3)' }}>
                      加入於 {joinDate}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            {ts && (
              <div
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { label: '推薦數', value: ts.recommendation_count, icon: '📝' },
                  { label: '收到 Like', value: ts.received_likes, icon: '❤️' },
                  { label: '收到 Save', value: ts.received_saves, icon: '🔖' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-3 text-center"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-xl mb-0.5">{stat.icon}</p>
                    <p className="text-lg font-black" style={{ color: 'var(--ink)' }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--ink3)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Level Progress ── */}
            {ts ? (
              <LevelProgress
                trustScore={{
                  recommendation_count: ts.recommendation_count,
                  received_likes: ts.received_likes,
                  received_saves: ts.received_saves,
                  trust_score: ts.trust_score,
                  level: ts.level as TrustLevel,
                }}
              />
            ) : (
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--ink3)' }}>
                  等級資料載入中…
                </p>
              </div>
            )}

            {/* ── Recommendations Placeholder ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Utensils size={15} style={{ color: 'var(--ink2)' }} />
                <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                  推薦過的品項
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface)', color: 'var(--ink3)' }}
                >
                  {ts?.recommendation_count ?? 0} 篇
                </span>
              </div>

              {/* TODO: 待串接 /users/{id}/recommendations */}
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: 'var(--card)', border: '1px dashed var(--border)' }}
              >
                <p className="text-3xl mb-3">🍽️</p>
                <p className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>
                  推薦列表即將推出
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink3)' }}>
                  我們正在建置個人推薦牆，敬請期待
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
