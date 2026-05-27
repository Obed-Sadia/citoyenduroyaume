'use client'

import { useEffect, useState } from 'react'
import { getEnluminureCountForNote } from '@/lib/actions/enluminures'

export function EnluminureBadge({ noteId }: { noteId: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    void getEnluminureCountForNote(noteId).then(setCount)
  }, [noteId])

  if (count === 0) return null

  return (
    <span className="text-[10px] tracking-[.04em]"
      style={{ color: 'var(--color-text-primary)' }}>
      ◈ {count}
    </span>
  )
}
