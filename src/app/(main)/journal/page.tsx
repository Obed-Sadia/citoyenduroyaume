import type { Metadata } from 'next'
import { JournalList } from '@/features/journal/JournalList'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'

export const metadata: Metadata = { title: 'Le Journal — BASILEIA' }

export default function JournalPage() {
  return (
    <div>
      <div className="px-4 pt-4 md:px-5 md:pt-5 pb-3">
        <BentoGrid cols={3}>
          <BentoCell span={2} variant="strong" className="px-4 py-3">
            <p
              className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
              style={{ color: 'var(--color-amber-400)' }}
            >
              Le Journal
            </p>
            <p
              className="text-[15px] font-[family-name:var(--font-editorial)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Méditations
            </p>
          </BentoCell>
          <BentoCell variant="base" className="flex flex-col justify-center items-center text-center">
            <p
              className="font-[family-name:var(--font-editorial)] text-[28px] font-[300] leading-none"
              style={{ color: 'var(--color-amber-400)' }}
            >
              —
            </p>
            <p
              className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              notes
            </p>
          </BentoCell>
        </BentoGrid>
      </div>
      <JournalList />
    </div>
  )
}
