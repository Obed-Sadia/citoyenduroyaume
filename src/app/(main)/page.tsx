import type { Metadata } from 'next'
import Link from 'next/link'
import { type DomainId, DOMAIN_META } from '@/features/carte/domain-constants'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'
import { FeedEntry, FeedHeader } from '@/components/layout/FeedEntry'

export const metadata: Metadata = { title: 'La Carte — BASILEIA' }

type DomainStats = { notes: number; secrets: number; level: number }

function computeLevel(total: number): number {
  if (total >= 21) return 5
  if (total >= 11) return 4
  if (total >= 6)  return 3
  if (total >= 3)  return 2
  if (total >= 1)  return 1
  return 0
}

async function fetchStats(): Promise<{
  domainStats: Partial<Record<DomainId, DomainStats>>
  totalNotes: number
  totalSecrets: number
}> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { domainStats: {}, totalNotes: 0, totalSecrets: 0 }

    const [notesRes, secretsRes] = await Promise.all([
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
      if (notesRes.error)   console.error('[fetchStats] notes:', notesRes.error.message)
      if (secretsRes.error) console.error('[fetchStats] secrets:', secretsRes.error.message)
    }

    const validIds = new Set<string>(DOMAIN_META.map((d) => d.id))

    const countByDomain = (rows: { domain_id: string | null }[] | null): Partial<Record<DomainId, number>> => {
      const map: Partial<Record<DomainId, number>> = {}
      rows?.forEach(({ domain_id }) => {
        if (domain_id && validIds.has(domain_id)) {
          const id = domain_id as DomainId
          map[id] = (map[id] ?? 0) + 1
        }
      })
      return map
    }

    const noteCounts   = countByDomain(notesRes.data)
    const secretCounts = countByDomain(secretsRes.data)

    const allIds = new Set<DomainId>([
      ...(Object.keys(noteCounts) as DomainId[]),
      ...(Object.keys(secretCounts) as DomainId[]),
    ])

    const domainStats: Partial<Record<DomainId, DomainStats>> = {}
    for (const id of allIds) {
      const notes   = noteCounts[id]   ?? 0
      const secrets = secretCounts[id] ?? 0
      domainStats[id] = { notes, secrets, level: computeLevel(notes + secrets) }
    }

    return {
      domainStats,
      totalNotes:   notesRes.data?.length   ?? 0,
      totalSecrets: secretsRes.data?.length ?? 0,
    }
  } catch {
    return { domainStats: {}, totalNotes: 0, totalSecrets: 0 }
  }
}

export default async function CartePage() {
  const { domainStats, totalNotes, totalSecrets } = await fetchStats()

  const totalItems = totalNotes + totalSecrets
  const domainesActifs = Object.values(domainStats).filter((s) => s && s.level > 0).length

  const topDomain = DOMAIN_META.reduce<{ meta: typeof DOMAIN_META[0]; stats: DomainStats } | null>(
    (best, meta) => {
      const s = domainStats[meta.id]
      if (!s) return best
      const total = s.notes + s.secrets
      if (!best) return { meta, stats: s }
      const bestTotal = best.stats.notes + best.stats.secrets
      return total > bestTotal ? { meta, stats: s } : best
    },
    null
  )

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              La Carte
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Ton Territoire
            </h1>
            <p className="font-[family-name:var(--font-editorial)] italic text-[14px] text-[var(--color-text-secondary)] leading-[1.8] mt-1 max-w-[400px]">
              {domainesActifs} domaine{domainesActifs > 1 ? 's' : ''} exploré{domainesActifs > 1 ? 's' : ''} sur 7. Continue à approfondir ta compréhension du Royaume.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {[
              { val: totalNotes,   lbl: 'Notes' },
              { val: totalSecrets, lbl: 'Secrets' },
              { val: `${domainesActifs}/7`, lbl: 'Domaines' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="flex flex-col items-end px-3 py-2 rounded-[7px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] min-w-[60px]">
                <span className="text-[18px] font-normal text-[var(--color-accent)] leading-none">{val}</span>
                <span className="text-[8px] font-medium tracking-[.08em] uppercase text-[var(--color-text-muted)] mt-1">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {/* Wide accent : domaine le plus actif */}
        {topDomain ? (
          <Link href={`/domaines/${topDomain.meta.id}`} className="col-span-2">
            <BentoCard label="Domaine le plus actif" accent className="h-full">
              <p className="font-[family-name:var(--font-editorial)] text-[16px] font-[500] text-[var(--color-text-primary)]">
                {topDomain.meta.label}
              </p>
              <p className="text-[9px] text-[var(--color-text-muted)]">
                {topDomain.stats.notes} notes · {topDomain.stats.secrets} secrets · niveau {topDomain.stats.level}
              </p>
            </BentoCard>
          </Link>
        ) : (
          <BentoCard label="Domaine le plus actif" wide accent>
            <p className="text-[12px] text-[var(--color-text-muted)] italic font-[family-name:var(--font-editorial)]">
              Aucun domaine exploré encore.
            </p>
          </BentoCard>
        )}

        {/* Stat cards — 4 premiers domaines */}
        {DOMAIN_META.slice(0, 4).map((meta) => {
          const s = domainStats[meta.id]
          return (
            <Link key={meta.id} href={`/domaines/${meta.id}`}>
              <BentoCard label={meta.label} className="h-full">
                <BentoVal>
                  {s?.level ?? 0}
                  <span className="text-[12px] text-[var(--color-text-muted)]">/5</span>
                </BentoVal>
                <BentoSub>{s ? `${s.notes + s.secrets} entrées` : 'Inexploré'}</BentoSub>
              </BentoCard>
            </Link>
          )
        })}

        {/* Stat total */}
        <BentoCard label="Entrées totales">
          <BentoVal>{totalItems}</BentoVal>
          <BentoSub>notes + secrets</BentoSub>
        </BentoCard>
      </div>

      {/* Feed — domaines restants */}
      <div className="flex-1 overflow-y-auto px-[26px] pb-5">
        <FeedHeader title="Domaines restants" />
        {DOMAIN_META.slice(4).map((meta) => {
          const s = domainStats[meta.id]
          return (
            <Link key={meta.id} href={`/domaines/${meta.id}`} className="block">
              <FeedEntry
                title={meta.label}
                excerpt={
                  s
                    ? `Niveau ${s.level} · ${s.notes + s.secrets} entrées`
                    : 'Inexploré — commence par ancrer un verset'
                }
                tag={s && s.level > 0 ? `Niv. ${s.level}` : 'Inexploré'}
                tagAccent={!!s && s.level > 0}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
