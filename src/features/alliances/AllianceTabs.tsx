'use client'

import { useState, useEffect, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { AlliesList } from './AlliesList'
import { InvitationList } from './InvitationList'
import { AllyVerseFeed } from './AllyVerseFeed'
import { TribeCard } from './TribeCard'
import { TribeCreateForm } from './TribeCreateForm'
import { getMyTribes, type TribeWithRole } from '@/lib/actions/tribes'
import { getPendingRequests, getMyShortCode, getAllyVerses, type AllyWithProfile, type AllyVerse } from '@/lib/actions/allies'

type Tab = 'allies' | 'invitations' | 'verses' | 'tribes'

const TAB_LABELS: Record<Tab, string> = {
  allies:      'Alliés',
  invitations: 'Invitations',
  verses:      'Versets',
  tribes:      'Tribus',
}

export function AllianceTabs() {
  const [tab, setTab]           = useState<Tab>('allies')
  const [tribes, setTribes]     = useState<TribeWithRole[]>([])
  const [pending, setPending]   = useState<AllyWithProfile[]>([])
  const [shortCode, setShortCode] = useState<string | null>(null)
  const [verses, setVerses]     = useState<AllyVerse[]>([])
  const [versesLoaded, setVersesLoaded] = useState(false)
  const [, startTransition]     = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const [p, sc, t] = await Promise.all([
        getPendingRequests(),
        getMyShortCode(),
        getMyTribes(),
      ])
      setPending(p)
      setShortCode(sc)
      setTribes(t)
    })
  }, [])

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
    if (newTab === 'verses' && !versesLoaded) {
      startTransition(async () => {
        const v = await getAllyVerses()
        setVerses(v)
        setVersesLoaded(true)
      })
    }
  }

  function refreshTribes() {
    startTransition(async () => {
      setTribes(await getMyTribes())
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-6 px-6 border-b border-[var(--color-border)] overflow-x-auto">
        {(['allies', 'invitations', 'verses', 'tribes'] as const).map((t) => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={cn(
              'py-3 shrink-0 text-[11px] font-medium tracking-[.06em] uppercase border-b-[1.5px] -mb-px transition-colors',
              tab === t
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-16 md:pb-6">
        {tab === 'allies' && (
          <div className="px-6 py-5">
            <AlliesList />
          </div>
        )}
        {tab === 'invitations' && (
          <InvitationList pendingReceived={pending} shortCode={shortCode} />
        )}
        {tab === 'verses' && (
          <AllyVerseFeed verses={verses} />
        )}
        {tab === 'tribes' && (
          <div className="px-6 py-5 flex flex-col gap-6">
            <TribeCreateForm onSuccess={refreshTribes} />
            {tribes.length === 0 && (
              <p className="text-[12px] text-center py-8"
                style={{ color: 'var(--color-text-muted)' }}>
                Aucune Tribu pour l&apos;instant.
              </p>
            )}
            {tribes.map((t) => <TribeCard key={t.id} tribe={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
