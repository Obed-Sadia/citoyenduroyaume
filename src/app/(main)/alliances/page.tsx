import type { Metadata } from 'next'
import { AllianceTabs } from '@/features/alliances/AllianceTabs'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default function AlliancesPage() {
  return (
    <div className="flex flex-col h-full">

      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-text-primary)] opacity-65 mb-2">
              Alliances
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Tes Alliés
            </h1>
            <p className="font-[family-name:var(--font-editorial)] italic text-[14px] text-[var(--color-text-secondary)] leading-[1.8] mt-1">
              {'Citoyens du même Royaume. Partage de territoire et de progression.'}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex flex-col items-end px-3 py-2 rounded-[7px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] min-w-[60px]">
              <span className="text-[18px] font-normal text-[var(--color-text-primary)] leading-none">—</span>
              <span className="text-[8px] font-medium tracking-[.08em] uppercase text-[var(--color-text-muted)] mt-1">Alliés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Alliance principale" wide accent>
          <p className="font-[family-name:var(--font-editorial)] text-[13px] text-[var(--color-text-secondary)] italic">
            {'Invite un allié pour commencer.'}
          </p>
        </BentoCard>
        <BentoCard label="En attente">
          <BentoVal>—</BentoVal>
          <BentoSub>demandes</BentoSub>
        </BentoCard>
      </div>

      {/* Tabs (allies / invitations / verses / tribes) */}
      <AllianceTabs />

    </div>
  )
}
