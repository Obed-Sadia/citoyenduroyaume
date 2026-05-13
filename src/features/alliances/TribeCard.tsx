'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TribeWithRole } from '@/lib/actions/tribes'
import { TribeMemberList } from './TribeMemberList'
import { TribeJournalFeed } from './TribeJournalFeed'

interface TribeCardProps {
  tribe: TribeWithRole
}

export function TribeCard({ tribe }: TribeCardProps) {
  const [tab, setTab] = useState<'journals' | 'members' | null>(null)

  function copyLink() {
    void navigator.clipboard.writeText(`${window.location.origin}/tribu/${tribe.invite_code}`)
  }

  return (
    <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between py-4">
        <div>
          <p className="text-[14px]" style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-editorial)',
          }}>
            {tribe.name}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {tribe.theme} · {tribe.memberCount} membre{tribe.memberCount > 1 ? 's' : ''}
            {tribe.role === 'admin' && (
              <span className="ml-2" style={{ color: 'var(--color-amber-400)' }}>admin</span>
            )}
          </p>
        </div>
        <button onClick={copyLink}
          className="text-[10px] tracking-[.06em] uppercase px-2 py-1 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
          Lien
        </button>
      </div>

      <div className="flex gap-4 mb-2">
        <button onClick={() => setTab(tab === 'journals' ? null : 'journals')}
          className={cn('text-[10px] tracking-[.06em] uppercase pb-1 border-b transition-colors',
            tab === 'journals'
              ? 'border-[var(--color-amber-400)] text-[var(--color-amber-400)]'
              : 'border-transparent text-[var(--color-text-muted)]'
          )}>
          Journals
        </button>
        {tribe.role === 'admin' && (
          <button onClick={() => setTab(tab === 'members' ? null : 'members')}
            className={cn('text-[10px] tracking-[.06em] uppercase pb-1 border-b transition-colors',
              tab === 'members'
                ? 'border-[var(--color-amber-400)] text-[var(--color-amber-400)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            Membres
          </button>
        )}
      </div>

      {tab === 'journals' && <div className="pb-4"><TribeJournalFeed tribeId={tribe.id} /></div>}
      {tab === 'members' && tribe.role === 'admin' && (
        <div className="pb-4"><TribeMemberList tribeId={tribe.id} /></div>
      )}
    </div>
  )
}
