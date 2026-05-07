import type { Metadata } from 'next'
import { JournalList } from '@/features/journal/JournalList'

export const metadata: Metadata = { title: 'Le Journal — BASILEIA' }

export default function JournalPage() {
  return (
    <div>
      <header
        className="border-b px-6 py-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p
          className="text-[10px] font-medium uppercase tracking-[.09em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Le Journal · Méditations
        </p>
      </header>
      <JournalList />
    </div>
  )
}
