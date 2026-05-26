'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { respondToAllyRequest } from '@/lib/actions/allies'
import { getInitials, nameToHsl } from '@/lib/utils'
import { EmailSearchForm } from './EmailSearchForm'
import { InviteBlock } from './InviteBlock'
import type { AllyWithProfile } from '@/lib/actions/allies'

interface InvitationListProps {
  pendingReceived: AllyWithProfile[]
  shortCode: string | null
}

export function InvitationList({ pendingReceived, shortCode }: InvitationListProps) {
  const router = useRouter()
  const [pending, setPending] = useState(pendingReceived)

  async function handleRespond(allyId: string, response: 'accepted' | 'rejected') {
    setPending(prev => prev.filter(a => a.id !== allyId))
    await respondToAllyRequest(allyId, response)
    router.refresh()
  }

  return (
    <div className="space-y-8 px-6 py-5">
      {/* Invitations reçues */}
      <section>
        <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-4"
           style={{ color: 'var(--color-text-muted)' }}>
          Invitations reçues
        </p>

        {pending.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            Aucune invitation reçue.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map(a => (
              <div key={a.id}
                className="flex items-center gap-3 rounded-md p-3"
                style={{ background: 'var(--color-bg-elevated)' }}>
                <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[12px] font-medium"
                  style={{
                    background: nameToHsl(a.ally.display_name),
                    color: 'var(--color-accent)',
                    border: '1.5px solid var(--color-accent-border)',
                  }}>
                  {getInitials(a.ally.display_name)}
                </div>
                <span className="flex-1 text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                  {a.ally.display_name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleRespond(a.id, 'accepted')}
                    className="px-3 py-1.5 rounded text-[12px] font-medium"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    Accepter
                  </button>
                  <button
                    onClick={() => void handleRespond(a.id, 'rejected')}
                    className="px-3 py-1.5 rounded text-[12px]"
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--color-text-muted)'
                    }}>
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Envoyer une invitation */}
      <section>
        <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-4"
           style={{ color: 'var(--color-text-muted)' }}>
          Envoyer une invitation
        </p>
        <EmailSearchForm />
        {shortCode && (
          <div className="mt-4">
            <InviteBlock shortCode={shortCode} />
          </div>
        )}
      </section>
    </div>
  )
}
