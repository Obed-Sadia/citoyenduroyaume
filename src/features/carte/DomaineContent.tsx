"use client"

import { useEffect, useState } from 'react'
import { useNotesStore } from '@/lib/stores/notes.store'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { useVersesStore } from '@/lib/stores/verses.store'
import { JournalCard } from '@/features/journal/JournalCard'
import { SecretCard } from '@/features/secrets/SecretCard'
import { VerseCard } from '@/features/bibliotheque/VerseCard'
import { DomaineHeader } from '@/features/carte/DomaineHeader'
import type { DomainId } from '@/features/carte/domain-constants'

type Tab = 'notes' | 'secrets' | 'verses'

const TABS: { id: Tab; label: string }[] = [
  { id: 'notes',   label: 'Notes'   },
  { id: 'secrets', label: 'Secrets' },
  { id: 'verses',  label: 'Versets' },
]

interface DomaineContentProps {
  domainId: DomainId
}

export function DomaineContent({ domainId }: DomaineContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('notes')

  const { notes,   loadFromDb: loadNotes   } = useNotesStore()
  const { secrets, loadFromDb: loadSecrets } = useSecretsStore()
  const { verses,  loadFromDb: loadVerses  } = useVersesStore()

  useEffect(() => {
    loadNotes()
    loadSecrets()
    loadVerses()
  }, [loadNotes, loadSecrets, loadVerses])

  const filteredNotes   = notes.filter((n) => n.domain === domainId)
  const filteredSecrets = secrets.filter((s) => s.domainId === domainId)
  const filteredVerses  = verses.filter((v) => v.domain === domainId)

  return (
    <>
      <DomaineHeader
        domainId={domainId}
        noteCount={filteredNotes.length}
        secretCount={filteredSecrets.length}
        verseCount={filteredVerses.length}
      />

      <div className="flex border-b border-[var(--color-border)] mb-5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-2.5 text-[13px] font-medium transition-colors"
              style={{
                fontFamily: 'var(--font-sans)',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        {activeTab === 'notes' && (
          filteredNotes.length === 0
            ? <EmptyState message="Aucune note dans ce domaine." />
            : filteredNotes.map((note) => <JournalCard key={note.id} note={note} />)
        )}
        {activeTab === 'secrets' && (
          filteredSecrets.length === 0
            ? <EmptyState message="Aucun secret dans ce domaine." />
            : filteredSecrets.map((secret) => <SecretCard key={secret.id} secret={secret} />)
        )}
        {activeTab === 'verses' && (
          filteredVerses.length === 0
            ? <EmptyState message="Aucun verset ancré dans ce domaine." />
            : filteredVerses.map((verse) => <VerseCard key={verse.id} verse={verse} />)
        )}
      </div>
    </>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p
      className="py-12 text-center text-[13px]"
      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
    >
      {message}
    </p>
  )
}
