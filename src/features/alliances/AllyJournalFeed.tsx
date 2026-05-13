'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { relativeTime } from '@/lib/utils'

interface SharedNote {
  id:         string
  title:      string | null
  excerpt:    string | null
  domain_id:  string | null
  created_at: string
}

export function AllyJournalFeed({ allyId }: { allyId: string }) {
  const [notes, setNotes]     = useState<SharedNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notes')
        .select('id, title, excerpt, domain_id, created_at')
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
          {note.excerpt && (
            <p className="text-[11px] mt-0.5 line-clamp-2"
              style={{ color: 'var(--color-text-muted)' }}>
              {note.excerpt}
            </p>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            {relativeTime(note.created_at)}
          </p>
        </div>
      ))}
    </div>
  )
}
