'use client'

import { useEffect, useState, useTransition } from 'react'
import { getMyAllies, type AllyWithProfile } from '@/lib/actions/allies'
import { AllyCard } from './AllyCard'

export function AlliesList() {
  const [allies, setAllies] = useState<AllyWithProfile[]>([])
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const all = await getMyAllies()
      setAllies(all.filter((x) => x.status === 'accepted'))
    })
  }, [])

  return (
    <div className="flex flex-col">
      {allies.length === 0 && (
        <p className="py-8 text-center text-[12px]"
           style={{ color: 'var(--color-text-muted)' }}>
          Aucun Allié pour l&apos;instant.
        </p>
      )}
      {allies.map((a) => <AllyCard key={a.id} ally={a} />)}
    </div>
  )
}
