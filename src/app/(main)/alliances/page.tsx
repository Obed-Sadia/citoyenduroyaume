import type { Metadata } from 'next'
import { AlliesList } from '@/features/alliances/AlliesList'
import { ConnectForm } from '@/features/alliances/ConnectForm'

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default function AlliancesPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)] mb-1">
          Alliances & Tribus
        </p>
      </header>

      <div className="px-6 py-5 flex flex-col gap-8 overflow-y-auto pb-16 md:pb-6">
        <ConnectForm />
        <AlliesList />
      </div>
    </div>
  )
}
