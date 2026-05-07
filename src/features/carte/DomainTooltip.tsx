"use client"

import { motion } from 'framer-motion'
import type { ExplorationLevel } from '@/features/carte/domain-constants'

const LEVEL_LABELS: Record<ExplorationLevel, string> = {
  5: 'Très exploré',
  4: 'Bien exploré',
  3: 'Exploré',
  2: 'Peu exploré',
  1: 'Découvert',
  0: 'Inexploré',
}

interface DomainTooltipProps {
  label: string
  exploration: ExplorationLevel
  journalCount: number
  secretCount: number
  style: React.CSSProperties
  onNavigate: () => void
}

export function DomainTooltip({
  label,
  exploration,
  journalCount,
  secretCount,
  style,
  onNavigate,
}: DomainTooltipProps) {
  return (
    <motion.div
      role="tooltip"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
      style={style}
      className="absolute z-20 min-w-[180px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-md)]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[.09em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <span className="shrink-0 rounded-[var(--radius-xs)] bg-[var(--color-amber-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-amber)]">
          {LEVEL_LABELS[exploration]}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)]">
        <span>{journalCount} journal{journalCount !== 1 ? 'x' : ''}</span>
        <span className="text-[var(--color-text-disabled)]">·</span>
        <span>{secretCount} secret{secretCount !== 1 ? 's' : ''}</span>
      </div>

      <button
        onClick={onNavigate}
        className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-amber-bg)] px-3 py-2 text-[11px] font-medium text-[var(--color-text-amber)] transition-colors hover:bg-[rgba(239,159,39,0.16)]"
      >
        Explorer
        <span aria-hidden="true">→</span>
      </button>
    </motion.div>
  )
}
