'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { approveTribeMember, rejectTribeMember } from '@/lib/actions/tribes'
import { getInitials, nameToHsl } from '@/lib/utils'

interface Member {
  id:           string
  status:       'pending' | 'member'
  display_name: string
}

export function TribeMemberList({ tribeId }: { tribeId: string }) {
  const [members, setMembers] = useState<Member[]>([])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('tribe_members')
      .select('id, status, citizen_profiles(display_name)')
      .eq('tribe_id', tribeId)
      .order('joined_at', { ascending: true })
    if (data) {
      setMembers(data.map((r) => ({
        id:           r.id,
        status:       r.status as 'pending' | 'member',
        display_name: (r.citizen_profiles as { display_name: string } | null)?.display_name ?? '?',
      })))
    }
  }

  useEffect(() => { void load() }, [tribeId])

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px]"
              style={{ background: nameToHsl(m.display_name), color: 'var(--color-amber-400)' }}>
              {getInitials(m.display_name)}
            </div>
            <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
              {m.display_name}
            </span>
            {m.status === 'pending' && (
              <span className="text-[10px] tracking-[.06em] uppercase"
                style={{ color: 'var(--color-text-muted)' }}>en attente</span>
            )}
          </div>
          {m.status === 'pending' && (
            <div className="flex gap-1">
              <button onClick={async () => { await approveTribeMember(m.id); void load() }}
                className="text-[10px] px-2 py-0.5 rounded border border-[var(--color-amber-border)] text-[var(--color-amber-400)]">
                Approuver
              </button>
              <button onClick={async () => { await rejectTribeMember(m.id); void load() }}
                className="text-[10px] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]">
                Refuser
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
