'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'
import { useNotesStore } from '@/lib/stores/notes.store'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { useVersesStore } from '@/lib/stores/verses.store'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'
import { FeedEntry, FeedHeader } from '@/components/layout/FeedEntry'

type DomainStats = { notes: number; secrets: number; verses: number; level: number }

function computeLevel(total: number): number {
  if (total >= 21) return 5
  if (total >= 11) return 4
  if (total >= 6)  return 3
  if (total >= 3)  return 2
  if (total >= 1)  return 1
  return 0
}

export function CarteDomainStats() {
  const notes   = useNotesStore((s) => s.notes)
  const secrets = useSecretsStore((s) => s.secrets)
  const verses  = useVersesStore((s) => s.verses)

  const { domainStats, totalItems } = useMemo(() => {
    const validIds = new Set<string>(DOMAIN_META.map((d) => d.id))
    const raw: Partial<Record<DomainId, { notes: number; secrets: number; verses: number }>> = {}

    for (const n of notes) {
      if (n.domain && validIds.has(n.domain)) {
        const c = raw[n.domain] ?? { notes: 0, secrets: 0, verses: 0 }
        raw[n.domain] = { ...c, notes: c.notes + 1 }
      }
    }
    for (const s of secrets) {
      if (s.domainId && validIds.has(s.domainId)) {
        const c = raw[s.domainId] ?? { notes: 0, secrets: 0, verses: 0 }
        raw[s.domainId] = { ...c, secrets: c.secrets + 1 }
      }
    }
    for (const v of verses) {
      if (v.domain && validIds.has(v.domain)) {
        const c = raw[v.domain] ?? { notes: 0, secrets: 0, verses: 0 }
        raw[v.domain] = { ...c, verses: c.verses + 1 }
      }
    }

    const domainStats: Partial<Record<DomainId, DomainStats>> = {}
    for (const [id, c] of Object.entries(raw) as [DomainId, { notes: number; secrets: number; verses: number }][]) {
      domainStats[id] = { ...c, level: computeLevel(c.notes + c.secrets + c.verses) }
    }

    const totalItems =
      notes.filter((n) => n.domain).length +
      secrets.filter((s) => s.domainId).length

    return { domainStats, totalItems }
  }, [notes, secrets, verses])

  const domainesActifs = Object.values(domainStats).filter((s) => s && s.level > 0).length

  const topDomain = DOMAIN_META.reduce<{ meta: typeof DOMAIN_META[0]; stats: DomainStats } | null>(
    (best, meta) => {
      const s = domainStats[meta.id]
      if (!s) return best
      const total = s.notes + s.secrets + s.verses
      if (!best) return { meta, stats: s }
      const bestTotal = best.stats.notes + best.stats.secrets + best.stats.verses
      return total > bestTotal ? { meta, stats: s } : best
    },
    null
  )

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[32px] pt-[28px] pb-[22px] border-b border-[var(--color-border)]">
        <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-text-muted)] mb-3">
          La Carte
        </p>
        <h1 className="font-[family-name:var(--font-editorial)] text-[34px] font-[400] text-[var(--color-text-primary)] leading-[1.15] tracking-[-0.02em]">
          Ton Territoire
        </h1>
        <p className="font-[family-name:var(--font-editorial)] italic text-[14px] text-[var(--color-text-secondary)] leading-[1.8] mt-2 max-w-[400px]">
          {domainesActifs} domaine{domainesActifs > 1 ? 's' : ''} exploré{domainesActifs > 1 ? 's' : ''} sur 7. Continue à approfondir ta compréhension du Royaume.
        </p>
      </div>

      {/* Bento grid */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_32px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
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

        {DOMAIN_META.slice(0, 3).map((meta) => {
          const s = domainStats[meta.id]
          return (
            <Link key={meta.id} href={`/domaines/${meta.id}`}>
              <BentoCard label={meta.label} className="h-full">
                <BentoVal>
                  {s?.level ?? 0}
                  <span className="text-[12px] text-[var(--color-text-muted)]">/5</span>
                </BentoVal>
                <BentoSub>{s ? `${s.notes + s.secrets + s.verses} entrées` : 'Inexploré'}</BentoSub>
              </BentoCard>
            </Link>
          )
        })}

        <BentoCard label="Entrées totales">
          <BentoVal>{totalItems}</BentoVal>
          <BentoSub>notes + secrets</BentoSub>
        </BentoCard>
      </div>

      {/* Feed — domaines restants */}
      <div className="flex-1 overflow-y-auto px-[32px] pb-5">
        <FeedHeader title="Domaines restants" />
        <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          {DOMAIN_META.slice(4).map((meta) => {
            const s = domainStats[meta.id]
            return (
              <Link key={meta.id} href={`/domaines/${meta.id}`} className="block">
                <FeedEntry
                  title={meta.label}
                  excerpt={
                    s
                      ? `Niveau ${s.level} · ${s.notes + s.secrets + s.verses} entrées`
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
    </div>
  )
}
