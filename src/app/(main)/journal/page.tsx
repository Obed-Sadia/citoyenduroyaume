import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Le Journal — BASILEIA' }

export default function JournalPage() {
  return (
    <div>
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)] mb-4">
          Le Journal · Méditations
        </p>
      </header>
      <div className="px-6 py-5">{/* TODO */}</div>
    </div>
  )
}
