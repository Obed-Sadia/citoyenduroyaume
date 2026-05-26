"use client"

import { FeedEntry } from '@/components/layout/FeedEntry'
import { relativeTime } from '@/lib/utils'
import type { Verse } from '@/lib/stores/verses.store'

interface VerseCardProps {
  verse: Verse
}

export function VerseCard({ verse }: VerseCardProps) {
  return (
    <FeedEntry
      verse={verse.text}
      reference={verse.reference}
      domain={verse.domain ?? undefined}
      date={relativeTime(verse.createdAt)}
    />
  )
}
