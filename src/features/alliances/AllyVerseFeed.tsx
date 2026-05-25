import { getInitials, nameToHsl, relativeTime } from '@/lib/utils'
import { DomainBadge } from '@/features/journal/DomainBadge'
import type { AllyVerse } from '@/lib/actions/allies'
import type { DomainId } from '@/features/carte/domain-constants'

interface AllyVerseFeedProps {
  verses: AllyVerse[]
}

export function AllyVerseFeed({ verses }: AllyVerseFeedProps) {
  if (verses.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          Aucun verset partagé par tes Alliés.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-6 py-5">
      {verses.map(verse => (
        <div
          key={verse.id}
          className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 space-y-3"
        >
          {/* Auteur */}
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-medium"
              style={{
                background: nameToHsl(verse.author.display_name),
                color: 'var(--color-amber-400)',
                border: '1.5px solid rgba(239,159,39,0.3)',
              }}
            >
              {getInitials(verse.author.display_name)}
            </div>
            <span
              className="text-[12px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {verse.author.display_name}
            </span>
          </div>

          {/* Référence + domaine */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[11px] font-medium uppercase tracking-[.09em]"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {verse.reference}
            </span>
            {verse.domain && <DomainBadge domain={verse.domain as DomainId} />}
          </div>

          {/* Texte du verset */}
          <p
            className="text-[18px] leading-relaxed italic"
            style={{
              fontFamily: 'var(--font-editorial)',
              color: 'var(--color-text-primary)',
            }}
          >
            {verse.text}
          </p>

          {/* Date */}
          <span
            className="text-[11px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {relativeTime(verse.created_at)}
          </span>
        </div>
      ))}
    </div>
  )
}
