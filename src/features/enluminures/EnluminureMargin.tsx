'use client'

import { useEffect, useState } from 'react'
import { getEnluminuresForNote, type Enluminure } from '@/lib/actions/enluminures'
import { EnluminureComposer } from './EnluminureComposer'

interface EnluminureMarginProps {
  noteId:   string
  isAuthor: boolean
}

export function EnluminureMargin({ noteId, isAuthor }: EnluminureMarginProps) {
  const [enluminures, setEnluminures] = useState<Enluminure[]>([])
  const [composing, setComposing]     = useState(false)

  async function load() {
    const data = await getEnluminuresForNote(noteId)
    setEnluminures(data)
  }

  useEffect(() => { void load() }, [noteId])

  return (
    <div className="mt-6 flex flex-col gap-3">
      {enluminures.map((e) => (
        <div key={e.id} className="pl-3 border-l border-[var(--color-border-mid)]">
          {e.highlighted_passage && (
            <p className="text-[11px] italic mb-1 line-clamp-2"
              style={{ color: 'var(--color-text-disabled)', fontFamily: 'var(--font-editorial)' }}>
              « {e.highlighted_passage} »
            </p>
          )}
          {e.type === 'text' ? (
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
              {e.content}
            </p>
          ) : (
            <>
              <p className="text-[10px] tracking-[.06em] uppercase mb-0.5"
                style={{ color: 'var(--color-text-primary)' }}>
                {e.content}
              </p>
              <p className="text-[12px] italic"
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-editorial)' }}>
                {e.verse_text}
              </p>
            </>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            — {e.author_name}
          </p>
        </div>
      ))}

      {!isAuthor && !composing && (
        <button
          onClick={() => setComposing(true)}
          className="self-start text-[10px] font-medium tracking-[.06em] uppercase transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          ◈ Enluminer
        </button>
      )}

      {composing && (
        <EnluminureComposer
          noteId={noteId}
          onSuccess={() => { setComposing(false); void load() }}
          onCancel={() => setComposing(false)}
        />
      )}
    </div>
  )
}
