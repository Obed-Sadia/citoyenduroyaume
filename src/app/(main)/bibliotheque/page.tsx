import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'La Bibliothèque — BASILEIA' }

export default function BibliothequePage() {
  return (
    <div>
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)] mb-4">
          La Bibliothèque · Versets ancrés
        </p>
      </header>
      <div className="px-6 py-5">{/* TODO */}</div>
    </div>
  )
}
