// src/features/journal/JournalCard.tsx
"use client"

import Link from 'next/link'
import { relativeTime } from '@/lib/utils'
import { DomainBadge } from '@/features/journal/DomainBadge'
import { EnluminureBadge } from '@/features/enluminures/EnluminureBadge'
import type { Note } from '@/features/journal/mock-notes'

interface JournalCardProps {
  note: Note
}

export function JournalCard({ note }: JournalCardProps) {
  const title = note.title.trim() || 'Sans titre'

  return (
    <Link
      href={`/journal/${note.id}`}
      className="group block rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-colors hover:border-[var(--color-amber-border)]"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p
          className="text-[16px] font-medium leading-snug"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-primary)' }}
        >
          {title}
        </p>
        {note.domain && <DomainBadge domain={note.domain} />}
      </div>

      {note.excerpt && (
        <p
          className="mb-3 line-clamp-2 text-[13px] leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {note.excerpt}
        </p>
      )}

      <div
        className="flex items-center gap-2 text-[11px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span>{relativeTime(note.createdAt)}</span>
        <span style={{ color: 'var(--color-text-disabled)' }}>·</span>
        <span>{note.wordCount} mot{note.wordCount !== 1 ? 's' : ''}</span>
        <EnluminureBadge noteId={note.id} />
      </div>
    </Link>
  )
}
