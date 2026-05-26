// src/features/journal/JournalCard.tsx
'use client'

import { useRouter } from 'next/navigation'
import { FeedEntry } from '@/components/layout/FeedEntry'
import { relativeTime } from '@/lib/utils'
import type { Note } from '@/features/journal/mock-notes'

interface JournalCardProps {
  note: Note
}

export function JournalCard({ note }: JournalCardProps) {
  const router = useRouter()
  const title = note.title.trim() || 'Sans titre'

  return (
    <FeedEntry
      title={title}
      excerpt={note.excerpt || undefined}
      tag={note.domain ?? undefined}
      tagAccent={!!note.domain}
      date={relativeTime(note.createdAt)}
      onClick={() => router.push(`/journal/${note.id}`)}
    />
  )
}
