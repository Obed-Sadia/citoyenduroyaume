import type { Metadata } from 'next'
import { HexMap, type DomainStats } from '@/features/carte/HexMap'
import { type DomainId, type ExplorationLevel, DOMAIN_META } from '@/features/carte/domain-constants'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'La Carte — BASILEIA' }

const VALID_DOMAIN_IDS = new Set<string>(DOMAIN_META.map((d) => d.id))

function computeExploration(total: number): ExplorationLevel {
  if (total >= 21) return 5
  if (total >= 11) return 4
  if (total >= 6)  return 3
  if (total >= 3)  return 2
  if (total >= 1)  return 1
  return 0
}

async function fetchDomainStats(): Promise<Partial<Record<DomainId, DomainStats>>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {}

    const [
      { data: notesRows, error: notesErr },
      { data: secretsRows, error: secretsErr },
    ] = await Promise.all([
      supabase
        .from('notes')
        .select('domain_id')
        .eq('user_id', user.id)
        .not('domain_id', 'is', null),
      supabase
        .from('secrets')
        .select('domain_id')
        .eq('user_id', user.id)
        .not('domain_id', 'is', null),
    ])

    if (process.env.NODE_ENV === 'development') {
      if (notesErr)   console.error('[fetchDomainStats] notes:', notesErr.message)
      if (secretsErr) console.error('[fetchDomainStats] secrets:', secretsErr.message)
    }

    const journalCounts: Partial<Record<DomainId, number>> = {}
    const secretCounts:  Partial<Record<DomainId, number>> = {}

    notesRows?.forEach(({ domain_id }) => {
      if (domain_id && VALID_DOMAIN_IDS.has(domain_id)) {
        const id = domain_id as DomainId
        journalCounts[id] = (journalCounts[id] ?? 0) + 1
      }
    })

    secretsRows?.forEach(({ domain_id }) => {
      if (domain_id && VALID_DOMAIN_IDS.has(domain_id)) {
        const id = domain_id as DomainId
        secretCounts[id] = (secretCounts[id] ?? 0) + 1
      }
    })

    const allDomains = new Set<DomainId>([
      ...(Object.keys(journalCounts) as DomainId[]),
      ...(Object.keys(secretCounts)  as DomainId[]),
    ])

    const result: Partial<Record<DomainId, DomainStats>> = {}
    for (const domainId of allDomains) {
      const journalCount = journalCounts[domainId] ?? 0
      const secretCount  = secretCounts[domainId]  ?? 0
      result[domainId] = {
        exploration:  computeExploration(journalCount + secretCount),
        journalCount,
        secretCount,
      }
    }

    return result
  } catch {
    return {}
  }
}

export default async function CartePage() {
  const stats = await fetchDomainStats()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] md:min-h-screen">
      <header className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] flex-shrink-0">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)]">
          La Carte
        </p>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <HexMap stats={stats} activeThisWeek={null} />
      </div>
    </div>
  )
}
