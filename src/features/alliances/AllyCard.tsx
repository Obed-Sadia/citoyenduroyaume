'use client'

import { useState } from 'react'
import { getInitials, nameToHsl } from '@/lib/utils'
import { AllyJournalFeed } from './AllyJournalFeed'
import type { AllyWithProfile } from '@/lib/actions/allies'

interface AllyCardProps {
  ally: AllyWithProfile
}

export function AllyCard({ ally }: AllyCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-medium"
            style={{
              background: nameToHsl(ally.ally.display_name),
              color: 'var(--color-amber-400)',
              border: '1.5px solid rgba(239,159,39,0.3)',
            }}
          >
            {getInitials(ally.ally.display_name)}
          </div>
          <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>
            {ally.ally.display_name}
          </span>
        </div>
        <span className="text-[10px] tracking-[.06em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="pb-4">
          <AllyJournalFeed allyId={ally.ally.id} />
        </div>
      )}
    </div>
  )
}
