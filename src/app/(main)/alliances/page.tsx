import type { Metadata } from 'next'
import { AllianceTabs } from '@/features/alliances/AllianceTabs'

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default function AlliancesPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)]">
          Alliances & Tribus
        </p>
      </header>
      <AllianceTabs />
    </div>
  )
}
