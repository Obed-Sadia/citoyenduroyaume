import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { DOMAIN_META } from '@/features/carte/domain-constants'
import type { DomainId } from '@/features/carte/domain-constants'
import { DomaineContent } from '@/features/carte/DomaineContent'

export const metadata: Metadata = { title: 'Domaine — BASILEIA' }

const VALID_IDS = new Set<string>(DOMAIN_META.map((d) => d.id))

interface Props {
  params: Promise<{ id: string }>
}

export default async function DomainePage({ params }: Props) {
  const { id } = await params

  if (!VALID_IDS.has(id)) notFound()

  return (
    <div className="px-5 py-5 pb-20">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[12px] transition-colors hover:text-[var(--color-text-secondary)]"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
      >
        ← La Carte
      </Link>

      <DomaineContent domainId={id as DomainId} />
    </div>
  )
}
