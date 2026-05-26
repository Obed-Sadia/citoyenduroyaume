"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { VerseCard } from '@/features/bibliotheque/VerseCard'
import { VerseSearch } from '@/features/bibliotheque/VerseSearch'
import { useVersesStore } from '@/lib/stores/verses.store'

const EASE = [0.16, 1, 0.3, 1] as const

export function VerseFeed() {
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <VerseSearch onSearch={handleSearch} />

      <div className="flex-1 overflow-y-auto px-[26px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <p
              className="text-[15px]"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-secondary)' }}
            >
              Aucun verset ancré.
            </p>
            <p className="mt-1 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              Saisis une référence et son texte ci-dessous.
            </p>
          </div>
        ) : (
          <motion.ul
            className="flex flex-col"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {filtered.map((verse) => (
              <motion.li
                key={verse.id}
                initial="hidden"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { ease: EASE, duration: 0.25 },
                  },
                }}
              >
                <VerseCard verse={verse} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  )
}
