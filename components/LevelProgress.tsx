'use client'

/**
 * LevelProgress — 等級進度詳細顯示（用於個人頁面）
 * 顯示：當前等級徽章、分數進度條、各項升級條件 checklist、下一步建議
 */

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import {
  getLevelDef,
  getNextLevelDef,
  computeRequirementProgress,
  computeScoreProgress,
  getNextActionTip,
  LEVEL_DEFS,
  TrustLevel,
  TrustScoreInput,
} from '@/lib/levelSystem'

interface LevelProgressProps {
  trustScore: TrustScoreInput
}

export default function LevelProgress({ trustScore }: LevelProgressProps) {
  const currentDef = getLevelDef(trustScore.level)
  const nextDef = getNextLevelDef(trustScore.level)
  const scoreProgress = computeScoreProgress(trustScore)
  const reqProgresses = computeRequirementProgress(trustScore)
  const tip = getNextActionTip(reqProgresses)
  const isMaxLevel = !nextDef

  return (
    <div className="space-y-4">
      {/* ── 等級階梯總覽 ─────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--ink3)' }}>
          升級路線
        </p>
        <div className="flex items-center gap-1">
          {LEVEL_DEFS.map((def, idx) => {
            const isCurrentOrPast =
              LEVEL_DEFS.findIndex(d => d.level === trustScore.level) >= idx
            const isCurrent = def.level === trustScore.level
            return (
              <div key={def.level} className="flex items-center gap-1 flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isCurrent ? 1.15 : 1 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1 flex-shrink-0"
                    style={{
                      background: isCurrentOrPast ? def.bgColor : 'var(--surface)',
                      border: `2px solid ${isCurrentOrPast ? def.color : 'var(--border)'}`,
                      boxShadow: isCurrent ? `0 0 0 3px ${def.borderColor}` : 'none',
                      opacity: isCurrentOrPast ? 1 : 0.4,
                    }}
                  >
                    {def.emoji}
                  </motion.div>
                  <span
                    className="text-xs text-center leading-tight truncate w-full px-1"
                    style={{
                      color: isCurrent ? def.color : 'var(--ink3)',
                      fontWeight: isCurrent ? 600 : 400,
                      fontSize: 10,
                    }}
                  >
                    {def.level}
                  </span>
                </div>
                {idx < LEVEL_DEFS.length - 1 && (
                  <div
                    className="h-0.5 flex-shrink-0 w-4"
                    style={{
                      background: isCurrentOrPast ? def.color : 'var(--border)',
                      opacity: 0.5,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 當前等級徽章 + 分數進度 ──────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: currentDef.bgColor,
          border: `1px solid ${currentDef.borderColor}`,
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{currentDef.emoji}</span>
              <div>
                <h3 className="text-lg font-bold leading-tight" style={{ color: currentDef.color }}>
                  {currentDef.level}
                </h3>
                <p className="text-xs" style={{ color: 'var(--ink3)' }}>
                  {currentDef.tagline}
                </p>
              </div>
            </div>
          </div>
          <div
            className="text-center px-3 py-1.5 rounded-xl"
            style={{ background: currentDef.borderColor }}
          >
            <p className="text-xs" style={{ color: currentDef.color }}>推薦權重</p>
            <p className="text-lg font-black" style={{ color: currentDef.color }}>
              ×{currentDef.trustWeight}
            </p>
          </div>
        </div>

        {/* Score progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs" style={{ color: 'var(--ink3)' }}>
              信任分數 {scoreProgress.current.toFixed(1)} 分
            </span>
            {!isMaxLevel && (
              <span className="text-xs" style={{ color: 'var(--ink3)' }}>
                距離 {nextDef?.level}：{Math.max(0, (nextDef?.scoreMin ?? 0) - scoreProgress.current).toFixed(1)} 分
              </span>
            )}
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--border)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: currentDef.color }}
              initial={{ width: 0 }}
              animate={{ width: `${scoreProgress.pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {!isMaxLevel && (
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: 10, color: 'var(--ink3)' }}>{scoreProgress.min} 分</span>
              <span style={{ fontSize: 10, color: 'var(--ink3)' }}>{nextDef?.scoreMin} 分</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 升級條件 Checklist ───────────────────────── */}
      {!isMaxLevel && reqProgresses.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ink2)' }}>
            升到 {nextDef?.emoji} {nextDef?.level} 需要
          </p>

          <div className="space-y-3">
            {reqProgresses.map(({ req, current, pct, done }) => (
              <div key={req.key}>
                <div className="flex items-center gap-2 mb-1.5">
                  {req.comingSoon ? (
                    <Clock size={15} style={{ color: 'var(--ink3)', flexShrink: 0 }} />
                  ) : done ? (
                    <CheckCircle2 size={15} style={{ color: '#22C55E', flexShrink: 0 }} />
                  ) : (
                    <Circle size={15} style={{ color: 'var(--ink3)', flexShrink: 0 }} />
                  )}
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span
                      className="text-sm"
                      style={{
                        color: req.comingSoon ? 'var(--ink3)' : done ? '#22C55E' : 'var(--ink)',
                        textDecoration: req.comingSoon ? 'none' : 'none',
                      }}
                    >
                      {req.icon} {req.label}
                    </span>
                    {req.comingSoon ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--surface)', color: 'var(--ink3)' }}
                      >
                        即將推出
                      </span>
                    ) : req.target !== null ? (
                      <span
                        className="text-xs flex-shrink-0 font-medium"
                        style={{ color: done ? '#22C55E' : 'var(--ink3)' }}
                      >
                        {Math.min(current, req.target)} / {req.target} {req.unit}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Progress bar per requirement */}
                {!req.comingSoon && req.target !== null && (
                  <div
                    className="h-1.5 rounded-full overflow-hidden ml-6"
                    style={{ background: 'var(--surface)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: done ? '#22C55E' : 'var(--brand)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 頂級老饕 ────────────────────────────────── */}
      {isMaxLevel && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: 'var(--brand-soft)',
            border: '1px solid rgba(234,88,12,0.3)',
          }}
        >
          <p className="text-2xl mb-1">👑</p>
          <p className="font-bold text-sm" style={{ color: 'var(--brand)' }}>
            你已達到最高等級！
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink3)' }}>
            你的每一票影響力是新手的 7.5 倍
          </p>
        </div>
      )}

      {/* ── 下一步行動建議 ───────────────────────────── */}
      {!isMaxLevel && (
        <div
          className="rounded-2xl px-4 py-3 flex items-start gap-2"
          style={{ background: 'var(--brand-soft)', border: '1px solid rgba(234,88,12,0.2)' }}
        >
          <span className="text-base flex-shrink-0">⚡</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--brand)' }}>
            <span className="font-semibold">最快升級方法：</span>
            {tip}
          </p>
        </div>
      )}
    </div>
  )
}
