'use client'

import { useState } from 'react'
import { respondToAllyRequest } from '@/lib/actions/allies'
import { getInitials, nameToHsl } from '@/lib/utils'

interface AllyRequestProps {
  id:          string
  displayName: string
  onRespond:   () => void
}

export function AllyRequest({ id, displayName, onRespond }: AllyRequestProps) {
  const [loading, setLoading] = useState(false)

  async function respond(response: 'accepted' | 'rejected') {
    setLoading(true)
    try {
      await respondToAllyRequest(id, response)
      onRespond()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between py-4"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-medium"
          style={{
            background: nameToHsl(displayName),
            color: 'var(--color-amber-400)',
            border: '1.5px solid rgba(239,159,39,0.3)',
          }}
        >
          {getInitials(displayName)}
        </div>
        <div>
          <p className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
            {displayName}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            demande à devenir Allié
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => respond('accepted')}
          disabled={loading}
          className="text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] disabled:opacity-30"
        >
          Accepter
        </button>
        <button
          onClick={() => respond('rejected')}
          disabled={loading}
          className="text-[11px] tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)] disabled:opacity-30"
        >
          Refuser
        </button>
      </div>
    </div>
  )
}
