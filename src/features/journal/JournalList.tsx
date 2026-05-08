// src/features/journal/JournalList.tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useNotesStore } from '@/lib/stores/notes.store'
import { JournalCard } from '@/features/journal/JournalCard'

const EASE = [0.16, 1, 0.3, 1] as const

export function JournalList() {
  const { notes, addNote } = useNotesStore()
  const loadFromDb = useNotesStore((s) => s.loadFromDb)
  const router = useRouter()

  useEffect(() => {
    loadFromDb()
  }, [loadFromDb])

  function handleCreate() {
    const id = crypto.randomUUID()
    addNote({
      id,
      title: '',
      excerpt: '',
      content: '',
      domain: null,
      createdAt: new Date().toISOString(),
      wordCount: 0,
    })
    router.push(`/journal/${id}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4">
        <p
          className="text-[11px] font-medium uppercase tracking-[.09em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {notes.length} méditation{notes.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleCreate}
          aria-label="Nouvelle méditation"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-amber-400)' }}
        >
          <Plus size={14} strokeWidth={1.5} />
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <p
            className="text-[15px]"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-secondary)' }}
          >
            Aucune méditation pour l'instant.
          </p>
          <p className="mt-1 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Commence par écrire ce que la Parole t'a dit aujourd'hui.
          </p>
        </div>
      ) : (
        <motion.ul
          className="flex flex-col gap-3 px-6 pb-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {notes.map((note) => (
            <motion.li
              key={note.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { ease: EASE, duration: 0.25 },
                },
              }}
            >
              <JournalCard note={note} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}
