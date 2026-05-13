'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { relativeTime } from '@/lib/utils'
import { EnluminureMargin } from '@/features/enluminures/EnluminureMargin'

interface SharedNote {
  id:         string
  title:      string | null
  domain_id:  string | null
  created_at: string
}

export function AllyJournalFeed({ allyId }: { allyId: string }) {
  const [notes, setNotes]           = useState<SharedNote[]>([])
  const [loading, setLoading]       = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notes')
        .select('id, title, domain_id, created_at')
        .eq('user_id', allyId)
        .eq('visibility', 'allies')
        .order('created_at', { ascending: false })
        .limit(10)
      setNotes(data ?? [])
      setLoading(false)
    }
    void load()
  }, [allyId])

  if (loading) return (
    <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
      Chargement…
    </p>
  )

  if (!notes.length) return (
    <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
      Aucun Journal partagé pour l'instant.
    </p>
  )

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <div key={note.id} className="rounded-[var(--radius-md)] px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[13px]" style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-editorial)',
          }}>
            {note.title ?? 'Sans titre'}
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            {relativeTime(note.created_at)}
          </p>
          <button onClick={() => toggleExpand(note.id)}
            className="text-[10px] tracking-[.06em] uppercase mt-1 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}>
            ◈ Enluminer
          </button>
          {expandedIds.has(note.id) && (
            <EnluminureMargin noteId={note.id} isAuthor={false} />
          )}
        </div>
      ))}
    </div>
  )
}
