'use client'

import { useState, useEffect, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { AlliesList } from './AlliesList'
import { ConnectForm } from './ConnectForm'
import { TribeCard } from './TribeCard'
import { TribeCreateForm } from './TribeCreateForm'
import { getMyTribes, type TribeWithRole } from '@/lib/actions/tribes'

type Tab = 'allies' | 'tribes'

export function AllianceTabs() {
  const [tab, setTab]       = useState<Tab>('allies')
  const [tribes, setTribes] = useState<TribeWithRole[]>([])
  const [, startTransition] = useTransition()

  function refreshTribes() {
    startTransition(async () => {
      setTribes(await getMyTribes())
    })
  }

  useEffect(() => { refreshTribes() }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-6 px-6 border-b border-[var(--color-border)]">
        {(['allies', 'tribes'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'py-3 text-[11px] font-medium tracking-[.06em] uppercase border-b-[1.5px] -mb-px transition-colors',
              tab === t
                ? 'border-[var(--color-amber-400)] text-[var(--color-amber-400)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            {t === 'allies' ? 'Alliés' : 'Tribus'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 pb-16 md:pb-6 flex flex-col gap-6">
        {tab === 'allies' && (
          <>
            <ConnectForm />
            <AlliesList />
          </>
        )}
        {tab === 'tribes' && (
          <>
            <TribeCreateForm onSuccess={refreshTribes} />
            {tribes.length === 0 && (
              <p className="text-[12px] text-center py-8"
                style={{ color: 'var(--color-text-muted)' }}>
                Aucune Tribu pour l&apos;instant.
              </p>
            )}
            {tribes.map((t) => <TribeCard key={t.id} tribe={t} />)}
          </>
        )}
      </div>
    </div>
  )
}
