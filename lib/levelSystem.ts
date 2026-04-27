// ─── EATSGOOD Level System ───────────────────────────────────────────────────
// 等級系統：定義升級條件、進度計算、UI 設定

export type TrustLevel = '新手吃貨' | '資深吃貨' | '美食達人' | '頂級老饕'

export interface Requirement {
  key: string
  label: string
  icon: string
  target: number | null   // null = binary (完成/未完成)
  unit: string
  comingSoon?: boolean    // 灰色顯示「即將推出」
}

export interface LevelDef {
  level: TrustLevel
  emoji: string
  scoreMin: number
  scoreMax: number | null   // null = 無上限（最高等級）
  trustWeight: number
  tagline: string
  color: string
  bgColor: string
  borderColor: string
  // 升到此等級所需的條件
  requirements: Requirement[]
}

// ─── 等級定義 ─────────────────────────────────────────────────────────────────

export const LEVEL_DEFS: LevelDef[] = [
  {
    level: '新手吃貨',
    emoji: '🥄',
    scoreMin: 0,
    scoreMax: 10,
    trustWeight: 0.2,
    tagline: '剛入門的美食探險家',
    color: '#9A8D83',
    bgColor: 'rgba(154,141,131,0.12)',
    borderColor: 'rgba(154,141,131,0.3)',
    requirements: [], // 起始等級，無入場門檻
  },
  {
    level: '資深吃貨',
    emoji: '🍜',
    scoreMin: 10,
    scoreMax: 50,
    trustWeight: 0.6,
    tagline: '有品味的飲食常客',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.10)',
    borderColor: 'rgba(59,130,246,0.25)',
    requirements: [
      {
        key: 'phone_verified',
        label: '完成手機號碼驗證',
        icon: '📱',
        target: null,
        unit: '',
        comingSoon: true,
      },
      {
        key: 'recommendation_count',
        label: '發出推薦（含照片）',
        icon: '📸',
        target: 3,
        unit: '篇',
      },
      {
        key: 'trust_score',
        label: '累積信任分數',
        icon: '⭐',
        target: 10,
        unit: '分',
      },
    ],
  },
  {
    level: '美食達人',
    emoji: '🍱',
    scoreMin: 50,
    scoreMax: 150,
    trustWeight: 1.0,
    tagline: '社群認可的飲食意見領袖',
    color: '#D97706',
    bgColor: 'rgba(217,119,6,0.10)',
    borderColor: 'rgba(217,119,6,0.25)',
    requirements: [
      {
        key: 'recommendation_count',
        label: '發出推薦',
        icon: '📝',
        target: 10,
        unit: '篇',
      },
      {
        key: 'received_interactions',
        label: '收到 Like 或 Save',
        icon: '❤️',
        target: 20,
        unit: '個',
      },
      {
        key: 'trust_score',
        label: '累積信任分數',
        icon: '⭐',
        target: 50,
        unit: '分',
      },
    ],
  },
  {
    level: '頂級老饕',
    emoji: '👑',
    scoreMin: 150,
    scoreMax: null,
    trustWeight: 1.5,
    tagline: '台北最值得信任的飲食聲音',
    color: '#EA580C',
    bgColor: 'rgba(234,88,12,0.10)',
    borderColor: 'rgba(234,88,12,0.30)',
    requirements: [
      {
        key: 'recommendation_count',
        label: '發出推薦',
        icon: '📝',
        target: 30,
        unit: '篇',
      },
      {
        key: 'received_interactions',
        label: '收到 Like 或 Save',
        icon: '❤️',
        target: 100,
        unit: '個',
      },
      {
        key: 'viral_contribution',
        label: '推薦貢獻過全城熱議',
        icon: '🔥',
        target: 1,
        unit: '次',
      },
      {
        key: 'trust_score',
        label: '累積信任分數',
        icon: '⭐',
        target: 150,
        unit: '分',
      },
    ],
  },
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getLevelDef(level: TrustLevel): LevelDef {
  return LEVEL_DEFS.find(l => l.level === level) ?? LEVEL_DEFS[0]
}

export function getNextLevelDef(level: TrustLevel): LevelDef | null {
  const idx = LEVEL_DEFS.findIndex(l => l.level === level)
  return idx >= 0 && idx < LEVEL_DEFS.length - 1 ? LEVEL_DEFS[idx + 1] : null
}

export function getLevelIndex(level: TrustLevel): number {
  return LEVEL_DEFS.findIndex(l => l.level === level)
}

// ─── 進度計算 ─────────────────────────────────────────────────────────────────

export interface TrustScoreInput {
  recommendation_count: number
  received_likes: number
  received_saves: number
  trust_score: number
  level: TrustLevel
  phone_verified?: boolean
  viral_contribution_count?: number
}

export interface RequirementProgress {
  req: Requirement
  current: number
  pct: number
  done: boolean
}

/** 計算升到下一等級的各項需求進度 */
export function computeRequirementProgress(
  ts: TrustScoreInput,
): RequirementProgress[] {
  const nextLevel = getNextLevelDef(ts.level)
  if (!nextLevel) return []

  const interactions = ts.received_likes + ts.received_saves

  return nextLevel.requirements.map(req => {
    // Binary (coming soon)
    if (req.target === null) {
      const done = ts.phone_verified ?? false
      return { req, current: done ? 1 : 0, pct: done ? 100 : 0, done }
    }

    let current = 0
    switch (req.key) {
      case 'recommendation_count':
        current = ts.recommendation_count
        break
      case 'received_interactions':
        current = interactions
        break
      case 'trust_score':
        current = ts.trust_score
        break
      case 'viral_contribution':
        current = ts.viral_contribution_count ?? 0
        break
    }

    const pct = Math.min(100, Math.round((current / req.target!) * 100))
    return { req, current, pct, done: current >= req.target! }
  })
}

/** 計算目前分數在本等級的進度條（0-100%）*/
export function computeScoreProgress(ts: {
  trust_score: number
  level: TrustLevel
}): { current: number; min: number; max: number; pct: number } {
  const def = getLevelDef(ts.level)
  const nextDef = getNextLevelDef(ts.level)

  if (!nextDef) {
    // 頂級老饕：滿格
    return { current: ts.trust_score, min: def.scoreMin, max: def.scoreMin + 100, pct: 100 }
  }

  const min = def.scoreMin
  const max = nextDef.scoreMin
  const current = Math.max(min, ts.trust_score)
  const pct = Math.min(100, Math.round(((current - min) / (max - min)) * 100))
  return { current, min, max, pct }
}

/** 根據目前進度，建議最快升級的下一步行動 */
export function getNextActionTip(progresses: RequirementProgress[]): string {
  // 找最接近完成的未完成項目
  const incomplete = progresses.filter(p => !p.done && !p.req.comingSoon)
  if (incomplete.length === 0) return '你已完成所有條件，等待系統更新等級！'

  const closest = incomplete.reduce((a, b) => (a.pct >= b.pct ? a : b))
  const remaining = (closest.req.target ?? 1) - closest.current

  return `再${closest.req.icon} ${remaining} ${closest.req.unit}，就能達成「${closest.req.label}」條件！`
}
