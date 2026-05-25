'use client'

import { useState } from 'react'
import { getInitials, nameToHsl } from '@/lib/utils'
import { AllyJournalFeed } from './AllyJournalFeed'
import { TerritoireAtlas } from '@/features/profil/stats/TerritoireAtlas'
import { getAllyTerritoire } from '@/lib/actions/allies'
import type { AllyWithProfile } from '@/lib/actions/allies'
import type { DomainId, ExplorationLevel } from '@/features/carte/domain-constants'

interface AllyCardProps {
  ally: AllyWithProfile
}

export function AllyCard({ ally }: AllyCardProps) {
  const [expanded, setExpanded]   = useState(false)
  const [territoire, setTerritoire] = useState<
    Partial<Record<DomainId, ExplorationLevel>> | null | undefined
  >(undefined)

  async function handleExpand(): Promise<void> {
    const next = !expanded
    setExpanded(next)
    if (next && territoire === undefined) {
      const data = await getAllyTerritoire(ally.ally.id)
      setTerritoire(data)
    }
  }

  return (
    <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => void handleExpand()}
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
        <span
          className="text-[10px] tracking-[.06em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="pb-4">
          {territoire && (
            <div className="mb-4">
              <p
                className="text-[10px] font-medium tracking-[.09em] uppercase mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Territoire Intérieur
              </p>
              <TerritoireAtlas exploration={territoire} />
            </div>
          )}
          <AllyJournalFeed allyId={ally.ally.id} />
        </div>
      )}
    </div>
  )
}
