'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { relativeTime } from '@/lib/utils'

interface TribeNote {
  id:         string
  title:      string | null
  created_at: string
  user_id:    string
}

export function TribeJournalFeed({ tribeId }: { tribeId: string }) {
  const [notes, setNotes]     = useState<TribeNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notes')
        .select('id, title, created_at, user_id')
        .eq('visibility', 'tribe')
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotes(data ?? [])
      setLoading(false)
    }
    void load()
  }, [tribeId])

  if (loading) return <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>Chargement…</p>
  if (!notes.length) return <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>Aucun Journal partagé dans cette Tribu.</p>

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <div key={note.id} className="rounded-[var(--radius-md)] px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[13px]" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}>
            {note.title ?? 'Sans titre'}
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            {relativeTime(note.created_at)}
          </p>
        </div>
      ))}
    </div>
  )
}
