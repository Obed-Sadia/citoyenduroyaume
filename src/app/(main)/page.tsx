import type { Metadata } from 'next'
import { HexMap, type DomainStats } from '@/features/carte/HexMap'
import type { DomainId } from '@/features/carte/domain-constants'

export const metadata: Metadata = { title: 'La Carte — BASILEIA' }

async function fetchDomainStats(): Promise<Partial<Record<DomainId, DomainStats>>> {
  try {
    return {}
  } catch {
    return {}
  }
}

export default async function CartePage() {
  const stats = await fetchDomainStats()

  return (
    <div>
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)] mb-4">
          La Carte · Atlas des 7 Domaines
        </p>
      </header>
      <div className="px-6 py-8">
        <HexMap stats={stats} activeThisWeek={null} />
      </div>
    </div>
  )
}
