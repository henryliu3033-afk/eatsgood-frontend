'use client'

import { RECOMMENDERS_AVATARS } from '@/lib/mockData'

interface TrustDensityProps {
  count: number
  goal?: number
  compact?: boolean
}

export default function TrustDensity({ count, goal = 100, compact = false }: TrustDensityProps) {
  const pct = Math.min((count / goal) * 100, 100)
  const isViral = count >= goal

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1">
          {RECOMMENDERS_AVATARS.slice(0, 3).map((src, i) => (
            <img key={i} src={src} alt="" className="w-5 h-5 rounded-full ring-1 ring-white object-cover" />
          ))}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--brand)' }}>{count} 人強推</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {RECOMMENDERS_AVATARS.map((src, i) => (
              <img key={i} src={src} alt=""
                className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
                style={{ zIndex: 5 - i }} />
            ))}
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {count} 人強推
          </span>
        </div>
        {isViral && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--brand)' }}>
            🔥 全城熱議
          </span>
        )}
      </div>

      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: isViral
              ? 'linear-gradient(90deg, #EA580C, #F97316)'
              : 'linear-gradient(90deg, #F97316, #FBBF24)',
          }}
        />
      </div>

      <p className="text-xs" style={{ color: 'var(--ink3)' }}>
        {isViral
          ? `已達 ${goal} 人門檻，正式引爆全城！`
          : `還差 ${goal - count} 人即可觸發全城熱議`}
      </p>
    </div>
  )
}
