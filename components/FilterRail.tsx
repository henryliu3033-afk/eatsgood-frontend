'use client'

import { motion } from 'framer-motion'
import { FilterTag } from '@/lib/types'

const TAGS: FilterTag[] = ['全部', '牛肉麵', '港式飲茶', '日式料理', '燒烤', '甜點', '素食']

interface FilterRailProps {
  active: FilterTag
  onChange: (tag: FilterTag) => void
}

export default function FilterRail({ active, onChange }: FilterRailProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 py-3"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
      {TAGS.map(tag => {
        const isActive = tag === active
        return (
          <motion.button
            key={tag}
            onClick={() => onChange(tag)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: isActive ? 'var(--brand)' : 'var(--surface)',
              color: isActive ? '#fff' : 'var(--ink2)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            #{tag}
          </motion.button>
        )
      })}
    </div>
  )
}
