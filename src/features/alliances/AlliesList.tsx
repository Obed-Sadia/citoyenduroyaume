'use client'

import { useEffect, useState, useTransition } from 'react'
import { getMyAllies, getPendingRequests, type AllyWithProfile } from '@/lib/actions/allies'
import { AllyCard } from './AllyCard'
import { AllyRequest } from './AllyRequest'

export function AlliesList() {
  const [allies, setAllies]   = useState<AllyWithProfile[]>([])
  const [pending, setPending] = useState<AllyWithProfile[]>([])
  const [, startTransition]   = useTransition()

  function refresh() {
    startTransition(async () => {
      const [a, p] = await Promise.all([getMyAllies(), getPendingRequests()])
      setAllies(a.filter((x) => x.status === 'accepted'))
      setPending(p)
    })
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="flex flex-col">
      {pending.map((req) => (
        <AllyRequest key={req.id} id={req.id}
          displayName={req.ally.display_name} onRespond={refresh} />
      ))}
      {allies.length === 0 && pending.length === 0 && (
        <p className="py-8 text-center text-[12px]"
          style={{ color: 'var(--color-text-muted)' }}>
          Aucun Allié pour l'instant.<br />
          Partage ton code pour commencer.
        </p>
      )}
      {allies.map((a) => <AllyCard key={a.id} ally={a} />)}
    </div>
  )
}
