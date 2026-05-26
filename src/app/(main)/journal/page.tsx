import type { Metadata } from 'next'
import { JournalList } from '@/features/journal/JournalList'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'

export const metadata: Metadata = { title: 'Journal — BASILEIA' }

export default function JournalPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              Le Journal
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Notes de méditation
            </h1>
          </div>
        </div>
      </div>

      {/* Bento */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Dernière note" wide accent>
          <p className="font-[family-name:var(--font-editorial)] text-[13px] font-[500] text-[var(--color-text-primary)]">
            Commence à écrire pour voir ta dernière note ici
          </p>
        </BentoCard>
        <BentoCard label="Mots écrits">
          <BentoVal>—</BentoVal>
          <BentoSub>ce mois</BentoSub>
        </BentoCard>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <JournalList />
      </div>
    </div>
  )
}
