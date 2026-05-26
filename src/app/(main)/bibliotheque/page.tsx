import type { Metadata } from 'next'
import { VerseFeed } from '@/features/bibliotheque/VerseFeed'
import { VerseCaptureBar } from '@/features/bibliotheque/VerseCaptureBar'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'

export const metadata: Metadata = { title: 'Bibliothèque — BASILEIA' }

export default function BiblioPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              La Bibliothèque
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Versets ancrés
            </h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex flex-col items-end px-3 py-2 rounded-[7px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] min-w-[60px]">
              <span className="text-[18px] font-normal text-[var(--color-accent)] leading-none">—</span>
              <span className="text-[8px] font-medium tracking-[.08em] uppercase text-[var(--color-text-muted)] mt-1">Versets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Verset mis en avant" wide accent>
          <p className="font-[family-name:var(--font-editorial)] italic text-[13px] text-[var(--color-text-secondary)] leading-[1.75]">
            Ancre ton premier verset ci-dessous.
          </p>
        </BentoCard>
        <BentoCard label="Domaines couverts">
          <BentoVal>—</BentoVal>
          <BentoSub>sur 7</BentoSub>
        </BentoCard>
      </div>

      {/* Tabs filtres (static for now) */}
      <div className="flex-shrink-0 flex px-[26px] border-b border-[var(--color-border)]">
        {(['Tous', 'Le Roi', 'Le Territoire', 'Les Lois'] as const).map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`text-[9px] font-medium tracking-[.10em] uppercase px-[14px] py-[11px] border-b-2 transition-colors ${
              i === 0
                ? 'text-[var(--color-accent)] border-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <VerseFeed />
      </div>

      {/* Capture bar */}
      <VerseCaptureBar />
    </div>
  )
}
