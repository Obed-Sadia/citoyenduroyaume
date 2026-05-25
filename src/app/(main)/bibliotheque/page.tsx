'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useVersesStore } from '@/lib/stores/verses.store'
import { VerseFeed } from '@/features/bibliotheque/VerseFeed'
import { VerseCaptureBar } from '@/features/bibliotheque/VerseCaptureBar'
import { VerseSearch } from '@/features/bibliotheque/VerseSearch'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'

export default function BibliothequePage() {
  const verses = useVersesStore((s) => s.verses)
  const loadFromDb = useVersesStore((s) => s.loadFromDb)
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadFromDb()
  }, [loadFromDb])

  const handleSearch = useCallback((q: string) => setQuery(q), [])

  const filtered = useMemo(() => {
    if (!query.trim()) return verses
    const q = query.toLowerCase()
    return verses.filter(
      (v) => v.reference.toLowerCase().includes(q) || v.text.toLowerCase().includes(q)
    )
  }, [verses, query])

  // Stats
  const thisMonth = useMemo(() => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return verses.filter((v) => new Date(v.createdAt ?? 0) >= start).length
  }, [verses])

  const domains = useMemo(
    () => new Set(verses.map((v) => v.domain).filter(Boolean)).size,
    [verses]
  )

  return (
    <div className="pb-20 px-4 pt-4 md:px-5 md:pt-5">

      {/* Header bento */}
      <BentoGrid cols={3} className="mb-2">
        <BentoCell span={2} variant="strong" className="px-4 py-3">
          <p
            className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
            style={{ color: 'var(--color-amber-400)' }}
          >
            La Bibliothèque
          </p>
          <p
            className="text-[15px] font-[family-name:var(--font-editorial)] font-[400]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Versets Ancrés
          </p>
        </BentoCell>

        <BentoCell variant="base" className="flex flex-col justify-center items-center text-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[32px] font-[300] leading-none"
            style={{ color: 'var(--color-amber-400)' }}
          >
            {verses.length}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ancrés
          </p>
        </BentoCell>
      </BentoGrid>

      <BentoGrid cols={3} className="mb-4">
        <BentoCell variant="base" className="flex flex-col justify-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[24px] font-[300] leading-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {thisMonth}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ce mois
          </p>
        </BentoCell>
        <BentoCell variant="base" className="flex flex-col justify-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[24px] font-[300] leading-none"
            style={{ color: 'var(--color-amber-400)' }}
          >
            {domains}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            domaines
          </p>
        </BentoCell>
        <BentoCell span={1} variant="base">
          <VerseSearch onSearch={handleSearch} />
        </BentoCell>
      </BentoGrid>

      {/* Feed dans un panel glass */}
      <BentoCell span={3} variant="base" className="col-span-full">
        <VerseFeed verses={filtered} />
      </BentoCell>

      <VerseCaptureBar />
    </div>
  )
}
